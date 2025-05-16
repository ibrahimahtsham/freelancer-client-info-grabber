import { token } from "./config";
import { fetchClientInfo } from "./client";

export async function fetchActiveThreads(onProgress, maxThreads = Infinity) {
  if (maxThreads === 0) {
    console.log("[fetchActiveThreads] maxThreads is 0, returning empty array.");
    return [];
  }
  console.log(`[fetchActiveThreads] maxThreads: ${maxThreads}`);
  const allThreads = [];
  let offset = 0;
  let hasMore = true;
  let batch = 0;

  while (hasMore && allThreads.length < maxThreads) {
    const remaining = maxThreads - allThreads.length;
    const limit = Math.min(100, remaining);
    console.log(
      `[fetchActiveThreads] Batch ${
        batch + 1
      }: offset=${offset}, limit=${limit}, remaining=${remaining}`
    );

    if (onProgress) {
      onProgress(
        Math.min(2 + batch, 5),
        `Fetching threads batch ${batch + 1} (offset ${offset})...`
      );
    }
    const res = await fetch(
      `https://www.freelancer.com/api/messages/0.1/threads/?folder=active&limit=${limit}&offset=${offset}`,
      {
        headers: { "freelancer-oauth-v1": token },
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch threads.");
    const threads = data.result?.threads || [];
    console.log(
      `[fetchActiveThreads] Batch ${batch + 1}: API returned ${
        threads.length
      } threads`
    );
    allThreads.push(...threads);
    console.log(
      `[fetchActiveThreads] Total threads accumulated: ${allThreads.length}`
    );

    if (threads.length < limit || allThreads.length >= maxThreads) {
      hasMore = false;
      console.log(
        `[fetchActiveThreads] Stopping: threads.length < limit (${threads.length} < ${limit}) or allThreads.length >= maxThreads (${allThreads.length} >= ${maxThreads})`
      );
    } else {
      offset += limit;
      batch++;
    }
  }

  // If we fetched more than maxThreads, trim the array
  if (allThreads.length > maxThreads) {
    console.log(
      `[fetchActiveThreads] Trimming allThreads from ${allThreads.length} to ${maxThreads}`
    );
  }
  return allThreads.slice(0, maxThreads);
}

// Helper to fetch the first message date for a thread
async function fetchFirstMessageDate(threadId) {
  const res = await fetch(
    `https://www.freelancer.com/api/messages/0.1/messages/?threads[]=${threadId}&limit=1&offset=0`,
    {
      headers: { "freelancer-oauth-v1": token },
    }
  );
  const data = await res.json();
  if (!res.ok) return null;
  const firstMsg = data.result?.messages?.[0];
  return firstMsg ? firstMsg.time_created : null;
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
  maxThreads = Infinity
) {
  console.log("[fetchThreadsWithProjectAndOwnerInfo] maxThreads:", maxThreads);
  if (maxThreads === 0) return [];
  if (onProgress) onProgress(0, "Fetching active threads...");
  const threads = await fetchActiveThreads(onProgress, maxThreads);
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
