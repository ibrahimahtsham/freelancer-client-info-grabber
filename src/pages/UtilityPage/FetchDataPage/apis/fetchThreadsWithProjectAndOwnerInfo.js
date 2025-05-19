import { fetchActiveThreads } from "./fetchActiveThreads";
import { fetchClientInfo } from "../../../ClientPage/apis/client";
import { fetchMyBidForProject } from "./fetchMyBidForProject";
import { fetchMyUserId } from "./fetchMyUserID";
import { fetchPaidMilestonesForProject } from "./fetchPaidMilestonesForProject";
import { fetchFirstMessageDate } from "./fetchFirstMessageDate";
import { DEFAULT_VALUES } from "../../../../constants";
import { formatTime, formatDateDDMMYYYY } from "../../../../utils/dateUtils";

// Flag to prevent concurrent executions
let isFetchingThreads = false;

// Function to implement delay for rate-limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchThreadsWithProjectAndOwnerInfo(
  progressCallback = null,
  maxThreads = null,
  fromDate = null,
  toDate = null,
  logger = console.log
) {
  // Prevent concurrent or recursive executions
  if (isFetchingThreads) {
    logger("Fetch operation already in progress, skipping duplicate call", "warning");
    return { threads: [], rateLimits: {} };
  }

  try {
    isFetchingThreads = true;
    logger("Starting fetchThreadsWithProjectAndOwnerInfo " +
      JSON.stringify({ maxThreads, fromDate, toDate }), "api");

    // First, fetch all active threads
    logger("Fetching active threads...", "api");
    const { threads, rateLimits } = await fetchActiveThreads(
      fromDate,
      toDate,
      maxThreads,
      logger
    );
    logger(`Fetched ${threads.length} active threads`, "info");

    if (!threads.length) {
      logger("No threads found, returning early", "warning");
      return { threads: [], rateLimits };
    }

    // Get user ID once for all calls
    logger("Fetching user ID...", "api");
    let myUserId;
    try {
      myUserId = await fetchMyUserId();
      logger("User ID: " + myUserId, "info");
    } catch (error) {
      logger("Error fetching user ID: " + error.message, "error");
      // Fallback to default if there's an error
      myUserId = DEFAULT_VALUES.MY_USER_ID;
      logger("Using default user ID: " + myUserId, "warning");
    }

    // Process each thread to get complete information
    const enrichedThreads = [];
    logger(`Starting to process ${threads.length} threads...`, "info");

    // Keep track of rate limit retries
    let rateLimitRetryCount = 0;
    const MAX_RATE_LIMIT_RETRIES = 3;

    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      const threadStartTime = Date.now();

      // Update progress if callback provided
      if (progressCallback) {
        const percent = Math.round((i / threads.length) * 100);
        const progressMessage = `Processing thread ${i + 1} of ${threads.length}`;
        logger(`Progress update: ${percent}%, ${progressMessage}`, "progress");
        progressCallback(percent, progressMessage);
      }

      logger(`Processing thread ${i + 1}/${threads.length}, ID: ${thread.id}`, "info");
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
        logger(`Fetching additional info for project ID: ${projectId}`, "api");
        try {
          // Add rate limit protection with backoff
          await delay(i * 300); // Stagger requests to avoid rate limits

          // Fetch project and client info with retry logic
          let info = null;
          try {
            info = await fetchClientInfo(projectId);
          } catch (err) {
            if (
              err.message?.includes("429") ||
              err.message?.includes("rate limit")
            ) {
              logger("Rate limit hit, waiting before retrying...", "warning");
              await delay(2000 + rateLimitRetryCount * 1000);
              rateLimitRetryCount++;

              // Only retry if we haven't exceeded our max retries
              if (rateLimitRetryCount <= MAX_RATE_LIMIT_RETRIES) {
                try {
                  info = await fetchClientInfo(projectId);
                } catch (retryErr) {
                  logger("Retry failed: " + retryErr.message, "error");
                }
              }
            }
          }

          // Process client info if available
          if (info) {
            // Project info
            if (info.project) {
              enrichedThread.projectTitle = info.project.title || "N/A";
              enrichedThread.projectUploadDate = info.project.submitdate
                ? `${formatDateDDMMYYYY(info.project.submitdate)} ${formatTime(
                    info.project.submitdate
                  )}`
                : "N/A";

              // Format bid price
              if (info.project.budget) {
                if (
                  info.project.budget.minimum &&
                  info.project.budget.maximum
                ) {
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
          }

          // Rest of the API calls - add delay between each to prevent rate limits
          try {
            logger(`Fetching bid info for project ${projectId}...`, "api");
            await delay(300);
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
          } catch (err) {
            logger(`Error fetching bid info: ${err.message}`, "error");
          }

          try {
            logger(
              `Fetching milestone payments for project ${projectId}...`,
              "api"
            );
            await delay(300);
            const { totalPaid } = await fetchPaidMilestonesForProject(
              projectId,
              myUserId
            );
            enrichedThread.totalPaidMilestones =
              totalPaid > 0 ? `$${totalPaid}` : "N/A";
          } catch (err) {
            logger(`Error fetching milestone info: ${err.message}`, "error");
          }

          try {
            logger(
              `Fetching first message date for thread ${thread.id}...`,
              "api"
            );
            await delay(300);
            if (thread.id) {
              const firstMsgDate = await fetchFirstMessageDate(thread.id);
              if (firstMsgDate) {
                enrichedThread.firstMessageDate = `${formatDateDDMMYYYY(
                  firstMsgDate
                )} ${formatTime(firstMsgDate)}`;
              }
            }
          } catch (err) {
            logger(`Error fetching message date: ${err.message}`, "error");
          }
        } catch (err) {
          logger(`Error processing thread ${thread.id}: ${err.message}`, "error");
        }
      }

      enrichedThreads.push(enrichedThread);
      const threadProcessTime = Date.now() - threadStartTime;
      logger(
        `Completed processing thread ${i + 1} in ${threadProcessTime}ms`,
        "info"
      );

      // Add delay between processing threads to avoid rate limits
      if (i < threads.length - 1) {
        await delay(500);
      }
    }

    // Final progress update
    if (progressCallback) {
      logger("Processing complete, final progress update: 100%", "progress");
      progressCallback(100, "Processing complete");
    }

    logger(`Finished processing all ${threads.length} threads`, "info");
    return { threads: enrichedThreads, rateLimits };
  } finally {
    // Always reset the flag when done, even if there was an error
    isFetchingThreads = false;
  }
}
