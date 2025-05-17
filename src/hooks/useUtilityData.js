import { useState, useEffect } from "react";
import { fetchActiveThreads } from "../utils/api/analytics/fetchActiveThreads";
import { fetchMyBidForProject } from "../utils/api/analytics/fetchMyBidForProject";
import { fetchPaidMilestonesForProject } from "../utils/api/analytics/fetchPaidMilestonesForProject";
import { fetchFirstMessageDate } from "../utils/api/analytics/fetchFirstMessageDate";
import { fetchClientInfo } from "../utils/api/client";
import { formatEpochToPakistanTime } from "../utils/dateUtils";

// Replace with your actual current user ID or retrieval method
const currentUserId = "9608928";

export function useUtilityData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const fetchedRows = [];
      try {
        const threads = await fetchActiveThreads();
        for (const thread of threads) {
          const projectId = thread.context;
          if (!projectId) continue;

          const clientInfo = await fetchClientInfo(projectId);
          const bidData = await fetchMyBidForProject(projectId, currentUserId);
          const totalPaid = await fetchPaidMilestonesForProject(
            projectId,
            currentUserId
          );
          const firstMsgTimestamp = await fetchFirstMessageDate(thread.id);

          fetchedRows.push({
            id: thread.id,
            threadId: thread.id,
            ownerId: clientInfo.project.owner_id,
            projectId,
            contextType: thread.context_type,
            projectTitle: clientInfo.project.title || "N/A",
            projectUploadDate: clientInfo.project.submitdate
              ? formatEpochToPakistanTime(clientInfo.project.submitdate)
              : "N/A",
            firstMessageDate: firstMsgTimestamp
              ? formatEpochToPakistanTime(firstMsgTimestamp)
              : "N/A",
            projectBidPrice: clientInfo.project.budget
              ? `$${clientInfo.project.budget}`
              : "N/A",
            projectLink: `https://freelancer.com/projects/${projectId}`,
            ownerName:
              clientInfo.client.public_name || clientInfo.client.username || "",
            ownerLocation: clientInfo.client.location
              ? `${clientInfo.client.location.city}, ${clientInfo.client.location.country}`
              : "N/A",
            clientProfileLink: clientInfo.client.username
              ? `https://freelancer.com/u/${clientInfo.client.username}`
              : "#",
            yourBidAmount: bidData.bid_amount
              ? `$${bidData.bid_amount}`
              : "N/A",
            totalPaidMilestones: `$${totalPaid}`,
            awarded:
              bidData.award_status === "awarded" ||
              bidData.award_status === "accepted"
                ? "Yes"
                : "No",
            otherStatus:
              bidData.award_status !== "awarded" && bidData.status
                ? bidData.status
                : "",
          });
        }
      } catch (error) {
        console.error("Error fetching utility data:", error);
      }
      setRows(fetchedRows);
      setLoading(false);
    }
    loadData();
  }, []);

  return { rows, loading };
}
