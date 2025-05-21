import {
  monitoredApiRequest,
  batchItems,
  needsBatching,
  delay,
  formatQueryParams,
} from "./utils/apiUtils";
import { enrichWithProjectDetails } from "./utils/dataTransformers";

/**
 * Fetch detailed project information for multiple projects
 * @param {Array<number>} projectIds - Array of project IDs to fetch
 * @param {Function} progressCallback - Function to report progress
 * @param {Function} logger - Logger function
 * @returns {Promise<Object>} - Map of projects with detailed information
 */
export async function fetchMissingProjectDetails(
  projectIds,
  progressCallback = () => {},
  logger = console.log
) {
  const log = typeof logger === "function" ? logger : console.log;

  try {
    log(`Fetching detailed info for ${projectIds.length} projects`, "api");

    const detailedProjects = {};
    const batchSize = 10;
    const batches = [];

    // Create batches of project IDs
    for (let i = 0; i < projectIds.length; i += batchSize) {
      batches.push(projectIds.slice(i, i + batchSize));
    }

    // Process batches sequentially
    for (let i = 0; i < batches.length; i++) {
      const batchIds = batches[i];

      try {
        // Create parameters object properly
        const params = {};

        // Add each project ID separately
        batchIds.forEach((id) => {
          params["projects[]"] = params["projects[]"] || [];
          params["projects[]"].push(id);
        });

        // Add other parameters
        params.full_description = true;
        params.jobs = true;
        params.upgrades = true;

        // Convert to query string
        const queryString = formatQueryParams(params);
        const endpoint = `projects/0.1/projects/?${queryString}`;

        log(
          `Fetching details for projects batch ${i + 1}/${batches.length}`,
          "api"
        );
        const response = await monitoredApiRequest(endpoint, {}, log);

        if (response.data?.result?.projects) {
          // Add projects to our collection
          Object.assign(detailedProjects, response.data.result.projects);
        }

        // Update progress
        progressCallback(
          Math.min(50, Math.floor(30 + ((i + 1) / batches.length) * 20)),
          `Processed details for ${Object.keys(detailedProjects).length}/${
            projectIds.length
          } projects`
        );
      } catch (error) {
        log(`Error processing batch ${i + 1}: ${error.message}`, "error");
      }
    }

    log(
      `Successfully fetched details for ${
        Object.keys(detailedProjects).length
      } projects`,
      "success"
    );
    return detailedProjects;
  } catch (error) {
    log(`Error fetching project details: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Fetches project details for all projects, handling batching if needed
 * @param {Array<Object>} bids Bid data containing project IDs
 * @param {Function} progressCallback Progress update callback
 * @param {Function} logger Logger function
 * @returns {Promise<Object>} Enriched bid data with project details
 */
export async function fetchAllProjectDetails(
  bids,
  progressCallback,
  logger = console.log
) {
  if (!bids || bids.length === 0) {
    return { data: [], rateLimits: {} };
  }

  // Extract unique project IDs from bids
  const projectIds = [...new Set(bids.map((bid) => bid.project_id))];

  logger(
    `Need to fetch details for ${projectIds.length} unique projects`,
    "info"
  );

  // Check if we need to batch the requests
  let enrichedBids = [...bids];
  let lastRateLimits = {};

  if (needsBatching(projectIds)) {
    const batches = batchItems(projectIds);
    logger(
      `Batching ${projectIds.length} projects into ${batches.length} requests`,
      "info"
    );

    let processedBatches = 0;

    for (const batch of batches) {
      const { data, rateLimits } = await fetchMissingProjectDetails(
        batch,
        logger
      );
      lastRateLimits = rateLimits;

      // Enrich the bid data with project details
      enrichedBids = enrichWithProjectDetails(enrichedBids, data);

      // Update progress
      processedBatches++;
      if (progressCallback) {
        const progress = Math.round((processedBatches / batches.length) * 100);
        progressCallback(
          progress,
          `Fetched project details: ${processedBatches}/${batches.length} batches (${batch.length} projects)`
        );
      }

      // Add delay between batches to avoid rate limits
      if (processedBatches < batches.length) {
        await delay(1000);
      }
    }
  } else {
    // Small enough to fetch in one request
    const { data, rateLimits } = await fetchMissingProjectDetails(
      projectIds,
      logger
    );
    lastRateLimits = rateLimits;

    // Enrich the bid data with project details
    enrichedBids = enrichWithProjectDetails(enrichedBids, data);

    if (progressCallback) {
      progressCallback(
        100,
        `Fetched details for all ${projectIds.length} projects`
      );
    }
  }

  return {
    data: enrichedBids,
    rateLimits: lastRateLimits,
  };
}
