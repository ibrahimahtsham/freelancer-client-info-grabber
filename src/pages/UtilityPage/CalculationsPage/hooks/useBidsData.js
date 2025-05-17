import { useState, useEffect } from "react";
import { apiRequest } from "../../../../utils/api/request";
import { API_ENDPOINTS } from "../../../../constants";

export default function useBidsData(rows, fromDate, toDate) {
  const [bidsData, setBidsData] = useState(null);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsError, setBidsError] = useState(null);

  useEffect(() => {
    // Only fetch if we have rows data
    if (!rows?.length) return;

    // Extract project IDs from rows
    const projectIds = rows
      .filter((row) => row.projectId && row.projectId !== "N/A")
      .map((row) => row.projectId);

    // Don't fetch if no valid project IDs
    if (!projectIds.length) return;

    const fetchBidsData = async () => {
      setBidsLoading(true);
      setBidsError(null);

      try {
        // Construct query string with project IDs
        const projectsQueryParam = projectIds
          .slice(0, 50) // Limit to 50 projects to avoid URL length issues
          .map((id) => `projects[]=${id}`)
          .join("&");

        // Add date range if provided
        let dateRangeParams = "";
        if (fromDate) {
          const fromTimestamp = Math.floor(new Date(fromDate).getTime() / 1000);
          dateRangeParams += `&from_time=${fromTimestamp}`;
        }

        if (toDate) {
          const toTimestamp = Math.floor(new Date(toDate).getTime() / 1000);
          dateRangeParams += `&to_time=${toTimestamp}`;
        }

        // Build the full API URL
        const url = `${API_ENDPOINTS.BIDS}?${projectsQueryParam}${dateRangeParams}`;

        // Make the API request
        const response = await apiRequest(url);

        if (response.error) {
          throw new Error(
            response.error.message || "Failed to fetch bids data"
          );
        }

        // Process the response
        const bids = response.data?.result?.bids || [];
        setBidsData({
          bids,
          totalBids: bids.length,
          awardedBids: bids.filter((bid) =>
            ["awarded", "accepted"].includes(bid.award_status)
          ).length,
          bidsByProject: projectIds.reduce((acc, projectId) => {
            acc[projectId] = bids.filter(
              (bid) => bid.project_id.toString() === projectId.toString()
            );
            return acc;
          }, {}),
          rateLimits: response.rateLimits,
        });
      } catch (error) {
        setBidsError(
          error.message || "An error occurred while fetching bids data"
        );
        console.error("Bids fetch error:", error);
      } finally {
        setBidsLoading(false);
      }
    };

    fetchBidsData();
  }, [rows, fromDate, toDate]);

  return { bidsData, bidsLoading, bidsError };
}
