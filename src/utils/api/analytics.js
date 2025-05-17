import { token } from "./config";
import { fetchClientInfo } from "./client";
import { apiRequest } from "./request";

export async function fetchActiveThreads(
  onProgress,
  maxThreads = Infinity,
  fromDate,
  toDate // <-- add this
) {
  const allThreads = [];
  let offset = 0;
  let hasMore = true;
  let batch = 0;

  // Convert fromDate and toDate to epoch seconds if provided
  const fromUpdatedTime = fromDate
    ? Math.floor(new Date(fromDate).getTime() / 1000)
    : undefined;
  const toUpdatedTime = toDate
    ? Math.floor(new Date(toDate).getTime() / 1000)
    : undefined;

  while (hasMore && allThreads.length < maxThreads) {
    const remaining = maxThreads - allThreads.length;
    const limit = Math.min(100, remaining);

    if (onProgress) {
      onProgress(
        Math.min(2 + batch, 5),
        `Fetching threads batch ${batch + 1} (offset ${offset})...`
      );
    }

    let url = `https://www.freelancer.com/api/messages/0.1/threads/?folder=active&limit=${limit}&offset=${offset}`;
    if (fromUpdatedTime) {
      url += `&from_updated_time=${fromUpdatedTime}`;
    }
    if (toUpdatedTime) {
      url += `&to_updated_time=${toUpdatedTime}`;
    }

    const data = await apiRequest(url);
    // Filter out support_chat threads
    const threads = (data.result?.threads || []).filter(
      (t) => t.thread?.context?.type !== "support_chat"
    );
    allThreads.push(...threads);

    if (threads.length < limit || allThreads.length >= maxThreads) {
      hasMore = false;
    } else {
      offset += limit;
      batch++;
    }
  }

  return allThreads.slice(0, maxThreads);
}

// Helper to fetch the first message date for a thread
async function fetchFirstMessageDate(threadId) {
  let offset = 0;
  const limit = 100;
  let earliest = null;

  while (true) {
    const batchUrl = `https://www.freelancer.com/api/messages/0.1/messages/?threads[]=${threadId}&limit=${limit}&offset=${offset}`;
    const data = await apiRequest(batchUrl);
    const messages = data.result?.messages || [];
    if (messages.length === 0) break;
    for (const msg of messages) {
      if (!earliest || msg.time_created < earliest) {
        earliest = msg.time_created;
      }
    }
    if (messages.length < limit) break;
    offset += limit;
  }

  if (!earliest) {
    console.warn(
      `[fetchFirstMessageDate] No messages found for thread ${threadId}.`
    );
  }
  return earliest;
}

export async function fetchMyBidForProject(projectId, myUserId) {
  const res = await fetch(
    `https://www.freelancer.com/api/projects/0.1/bids/?projects[]=${projectId}&bidders[]=${myUserId}`,
    {
      headers: { "freelancer-oauth-v1": token },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch bids.");
  const bids = data.result?.bids || [];
  // There should be at most one bid for this user/project
  return bids[0] || null;
}

export async function fetchMyUserId() {
  const res = await fetch("https://www.freelancer.com/api/users/0.1/self/", {
    headers: { "freelancer-oauth-v1": token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch user info.");
  return data.result?.id;
}

export async function fetchPaidMilestonesForProject(projectId, myUserId) {
  const res = await fetch(
    `https://www.freelancer.com/api/projects/0.1/milestones/?projects[]=${projectId}&bidders[]=${myUserId}`,
    {
      headers: { "freelancer-oauth-v1": token },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch milestones.");

  // Convert milestones to array if it's an object
  let milestonesRaw = data.result?.milestones;
  let milestones = [];
  if (Array.isArray(milestonesRaw)) {
    milestones = milestonesRaw;
  } else if (milestonesRaw && typeof milestonesRaw === "object") {
    milestones = Object.values(milestonesRaw);
  }

  // Filter for released/cleared milestones (paid)
  const paidMilestones = milestones.filter(
    (m) => m.status === "cleared" || m.status === "released"
  );
  // Sum the amounts
  const totalPaid = paidMilestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  return { milestones: paidMilestones, totalPaid };
}

export async function fetchThreadsWithProjectAndOwnerInfo(
  onProgress,
  maxThreads = Infinity,
  fromDate,
  toDate
) {
  if (maxThreads === 0) return [];
  if (onProgress) onProgress(0, "Fetching active threads...");
  const threads = await fetchActiveThreads(
    onProgress,
    maxThreads,
    fromDate,
    toDate
  );
  if (!threads.length) return [];

  if (onProgress) onProgress(5, "Fetching user ID...");
  const myUserId = await fetchMyUserId();

  const total = threads.length;
  let completed = 0;

  const results = await Promise.all(
    threads.map(async (thread, idx) => {
      if (onProgress) {
        onProgress(
          5 + Math.floor((idx / total) * 90),
          `Processing thread ${idx + 1} of ${total}...`
        );
      }

      const projectId = thread.thread?.context?.id;
      let projectInfo = null;
      let ownerInfo = null;
      let myBid = null;
      let error = null;
      let projectUploadDate = null;
      let firstMessageDate = null;
      let bidPrice = null;
      let projectLink = null;
      let clientProfileLink = null;
      let totalPaid = 0;
      let milestones = [];

      if (projectId) {
        try {
          const info = await fetchClientInfo(projectId);
          projectInfo = info.project;
          ownerInfo = info.client;

          myBid = await fetchMyBidForProject(projectId, myUserId);

          const milestoneResult = await fetchPaidMilestonesForProject(
            projectId,
            myUserId
          );
          milestones = milestoneResult.milestones;
          totalPaid = milestoneResult.totalPaid;

          projectUploadDate = projectInfo?.submitdate
            ? new Date(projectInfo.submitdate * 1000).toLocaleString()
            : null;

          if (projectInfo?.budget?.minimum && projectInfo?.budget?.maximum) {
            bidPrice = `$${projectInfo.budget.minimum} - $${projectInfo.budget.maximum}`;
          } else if (projectInfo?.budget?.amount) {
            bidPrice = `$${projectInfo.budget.amount}`;
          }

          projectLink = projectInfo?.id
            ? `https://www.freelancer.com/projects/${projectInfo.id}`
            : null;

          clientProfileLink = ownerInfo?.username
            ? `https://www.freelancer.com/u/${ownerInfo.username}`
            : null;

          firstMessageDate = thread.id
            ? await fetchFirstMessageDate(thread.id)
            : null;
          if (firstMessageDate)
            firstMessageDate = new Date(
              firstMessageDate * 1000
            ).toLocaleString();
        } catch (err) {
          error = err.message;
        }
      }

      completed++;
      if (onProgress) {
        const pct = 5 + Math.floor((completed / total) * 90);
        onProgress(pct, `Processed thread ${completed} of ${total}...`);
      }

      return {
        ...thread,
        projectInfo,
        ownerInfo,
        myBid,
        error,
        projectUploadDate,
        firstMessageDate,
        bidPrice,
        projectLink,
        clientProfileLink,
        totalPaid,
        milestones,
      };
    })
  );

  if (onProgress) onProgress(100, "Done!");
  return results;
}
