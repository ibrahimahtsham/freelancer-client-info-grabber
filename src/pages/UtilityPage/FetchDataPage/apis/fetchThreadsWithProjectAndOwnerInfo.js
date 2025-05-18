import { fetchActiveThreads } from "./fetchActiveThreads";
import { fetchClientInfo } from "../../../ClientPage/apis/client";
import { fetchMyBidForProject } from "./fetchMyBidForProject";
import { fetchMyUserId } from "./fetchMyUserID";
import { fetchPaidMilestonesForProject } from "./fetchPaidMilestonesForProject";
import { fetchFirstMessageDate } from "./fetchFirstMessageDate";
import { DEFAULT_VALUES } from "../../../../constants";
import { formatTime, formatDateDDMMYYYY } from "../../../../utils/dateUtils"; // Import additional formatting function

export async function fetchThreadsWithProjectAndOwnerInfo(
  progressCallback = null,
  maxThreads = null, // Changed to accept null for unlimited
  fromDate = null,
  toDate = null
) {
  // First, fetch all active threads
  const { threads, rateLimits } = await fetchActiveThreads(
    fromDate,
    toDate,
    maxThreads // Pass null when no limit should be applied
  );

  if (!threads.length) return { threads: [], rateLimits };

  // Get user ID once for all calls
  let myUserId;
  try {
    myUserId = await fetchMyUserId();
  } catch {
    // Fallback to default if there's an error
    myUserId = DEFAULT_VALUES.MY_USER_ID;
  }

  // Process each thread to get complete information
  const enrichedThreads = [];
  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];

    // Update progress if callback provided
    if (progressCallback) {
      const percent = Math.round((i / threads.length) * 100);
      progressCallback(
        percent,
        `Processing thread ${i + 1} of ${threads.length}`
      );
    }

    const projectId = thread.thread?.context?.id;
    const enrichedThread = {
      id: thread.id,
      threadId: thread.id,
      ownerId: thread.thread?.owner || "N/A",
      projectId: projectId || "N/A",
      contextType: thread.thread?.context?.type || "N/A",
      projectTitle: "N/A",
      projectUploadDate: "N/A",
      firstMessageDate: "N/A",
      projectBidPrice: "N/A",
      projectLink: projectId
        ? `https://www.freelancer.com/projects/${projectId}`
        : "",
      ownerName: "N/A",
      ownerLocation: "N/A",
      clientProfileLink: "",
      yourBidAmount: "N/A",
      totalPaidMilestones: "N/A",
      awarded: "No",
      otherStatus: "N/A",
    };

    // Only fetch additional info if we have a project ID
    if (projectId) {
      try {
        // Fetch project and client info
        const info = await fetchClientInfo(projectId);

        // Project info
        if (info.project) {
          enrichedThread.projectTitle = info.project.title || "N/A";

          // Use formatDateDDMMYYYY and formatTime for date formatting
          enrichedThread.projectUploadDate = info.project.submitdate
            ? `${formatDateDDMMYYYY(info.project.submitdate)} ${formatTime(
                info.project.submitdate
              )}`
            : "N/A";

          // Format bid price
          if (info.project.budget) {
            if (info.project.budget.minimum && info.project.budget.maximum) {
              enrichedThread.projectBidPrice = `$${info.project.budget.minimum} - $${info.project.budget.maximum}`;
            } else if (info.project.budget.amount) {
              enrichedThread.projectBidPrice = `$${info.project.budget.amount}`;
            }
          }
        }

        // Client info
        if (info.client) {
          enrichedThread.ownerName =
            info.client.public_name || info.client.username || "N/A";

          // Format location
          const location = info.client.location || {};
          if (location.city && location.country?.name) {
            enrichedThread.ownerLocation = `${location.city}, ${location.country.name}`;
          } else if (location.city) {
            enrichedThread.ownerLocation = location.city;
          } else if (location.country?.name) {
            enrichedThread.ownerLocation = location.country.name;
          }

          // Client profile link
          if (info.client.username) {
            enrichedThread.clientProfileLink = `https://www.freelancer.com/u/${info.client.username}`;
          }
        }

        // Get bid info
        const myBid = await fetchMyBidForProject(projectId, myUserId);
        if (myBid) {
          enrichedThread.yourBidAmount = myBid.amount
            ? `$${myBid.amount}`
            : "N/A";
          enrichedThread.awarded = ["awarded", "accepted"].includes(
            myBid.award_status
          )
            ? "Yes"
            : "No";
          enrichedThread.otherStatus = !["awarded", "accepted"].includes(
            myBid.award_status
          )
            ? myBid.award_status
            : "N/A";
        }

        // Get milestone payment info
        const { totalPaid } = await fetchPaidMilestonesForProject(
          projectId,
          myUserId
        );
        enrichedThread.totalPaidMilestones =
          totalPaid > 0 ? `$${totalPaid}` : "N/A";

        // Get first message date
        if (thread.id) {
          const firstMsgDate = await fetchFirstMessageDate(thread.id);
          if (firstMsgDate) {
            // Use formatDateDDMMYYYY and formatTime for date and time formatting
            enrichedThread.firstMessageDate = `${formatDateDDMMYYYY(
              firstMsgDate
            )} ${formatTime(firstMsgDate)}`;
          }
        }
      } catch (err) {
        // Continue with what we have if any API call fails
        console.warn(`Error processing thread ${thread.id}:`, err.message);
      }
    }

    enrichedThreads.push(enrichedThread);
  }

  // Final progress update
  if (progressCallback) {
    progressCallback(100, "Processing complete");
  }

  return { threads: enrichedThreads, rateLimits };
}
