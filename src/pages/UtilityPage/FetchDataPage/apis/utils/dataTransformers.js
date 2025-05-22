/**
 * Transforms raw bid data into a standardized format
 * @param {Object} bidData Raw bid data from the API
 * @returns {Array} Standardized bid data
 */
export function transformBidsData(bidData) {
  if (!bidData?.result?.bids) {
    return [];
  }

  const { bids = [], projects = {}, users = {} } = bidData.result;

  return bids.map((bid) => {
    const project = projects[bid.project_id] || {};
    const client = users[bid.project_owner_id] || {};

    return {
      bid_id: bid.id,
      project_id: bid.project_id,
      project_title: project.title || "No Title",
      project_url: `https://www.freelancer.com/projects/${bid.project_id}`,
      project_created: project.time_submitted || null,
      bid_amount: bid.amount,
      bid_time: bid.time_submitted,
      award_status: bid.award_status || "pending",
      awarded_time: bid.time_awarded,
      paid_amount: bid.paid_amount || 0,
      client_id: bid.project_owner_id,
      client_name: client.display_name || client.username || "Unknown",
      client_url: client.username
        ? `https://www.freelancer.com/u/${client.username}`
        : "",
      // Fields that will be populated from additional API calls
      project_type: null,
      recruiter_project: false,
      min_budget: null,
      max_budget: null,
      total_bids: null,
      avg_bid: null,
      skills: [],
      bid_proposal_link: `https://www.freelancer.com/projects/${bid.project_id}/proposals`,
      received_response: false,
      response_time: null,
      first_message_time: null,
      client_country: null,
      client_rating: null,
      client_payment_verified: null,
      milestones: [],
      total_milestone_amount: 0,
    };
  });
}

/**
 * Enriches bid data with project details
 * @param {Array} bids Existing bid data
 * @param {Object} projectDetails Project details from API
 * @returns {Array} Enriched bid data
 */
export function enrichWithProjectDetails(bids, projectDetails) {
  if (!projectDetails?.result?.projects) {
    return bids;
  }

  const projects = projectDetails.result.projects;

  return bids.map((bid) => {
    const project = projects[bid.project_id];

    if (!project) return bid;

    return {
      ...bid,
      project_type: project.type || "unknown",
      recruiter_project: project.hireme || false,
      min_budget: project.minimum_budget || project.budget?.minimum || null,
      max_budget: project.maximum_budget || project.budget?.maximum || null,
      total_bids: project.bid_stats?.bid_count || null,
      avg_bid: project.bid_stats?.avg_bid || null,
      skills: (project.jobs || []).map((job) => job.name),
    };
  });
}

/**
 * Enriches bid data with thread information
 * @param {Array} bids Existing bid data
 * @param {Object} threadData Thread data from API
 * @returns {Array} Enriched bid data
 */
export function enrichWithThreadInfo(bids, threadData) {
  if (!threadData?.result?.threads && !Array.isArray(threadData)) {
    return bids;
  }

  // Handle either direct array or nested .result.threads
  const threads = threadData?.result?.threads || threadData;

  // Create a map of project_id to thread for faster lookups
  const projectThreadMap = {};
  threads.forEach((thread) => {
    const contextObj = thread.thread?.context || thread.context;
    const projectId = contextObj?.id;
    if (contextObj?.type === "project" && projectId) {
      projectThreadMap[projectId] = thread;
    }
  });

  return bids.map((bid) => {
    const thread = projectThreadMap[bid.project_id];

    if (!thread) return bid;

    // Get time_created from the correct location
    const timeCreated = thread.thread?.time_created || thread.time_created;

    // Calculate response time in seconds if we have both times
    let responseTime = null;
    if (timeCreated && bid.bid_time) {
      responseTime = timeCreated - bid.bid_time;
    }

    return {
      ...bid,
      received_response: Boolean(thread),
      response_time: responseTime,
      first_message_time: timeCreated,
    };
  });
}

/**
 * Enriches bid data with milestone payment details
 * @param {Array} bids Existing bid data
 * @param {Object} milestoneData Milestone data from API
 * @returns {Array} Enriched bid data
 */
export function enrichWithMilestoneData(bids, milestoneData) {
  if (!milestoneData?.result?.milestones) {
    return bids;
  }

  const milestones = milestoneData.result.milestones;

  // Group milestones by bid_id
  const milestonesPerBid = {};
  milestones.forEach((milestone) => {
    if (!milestonesPerBid[milestone.bid_id]) {
      milestonesPerBid[milestone.bid_id] = [];
    }
    milestonesPerBid[milestone.bid_id].push(milestone);
  });

  return bids.map((bid) => {
    const bidMilestones = milestonesPerBid[bid.bid_id] || [];
    let totalAmount = 0;

    // Use a safer approach than reduce
    for (let i = 0; i < bidMilestones.length; i++) {
      const m = bidMilestones[i];
      totalAmount += parseFloat(m.amount) || 0;
    }

    return {
      ...bid,
      milestones: bidMilestones,
      total_milestone_amount: totalAmount,
    };
  });
}

/**
 * Enriches bid data with client profile details
 * @param {Array} bids Existing bid data
 * @param {Object} clientData Client data from API
 * @returns {Array} Enriched bid data
 */
export function enrichWithClientData(bids, clientData) {
  if (!clientData?.result?.users) {
    return bids;
  }

  const clients = clientData.result.users;

  return bids.map((bid) => {
    const client = clients[bid.client_id];

    if (!client) return bid;

    return {
      ...bid,
      client_country: client.location?.country?.name || null,
      client_rating:
        client.employer_reputation?.entire_history?.overall || null,
      client_payment_verified: client.status?.payment_verified || false,
    };
  });
}

/**
 * Transform raw API data into a unified data structure for the UI
 * @param {Object} data - Raw data from various API endpoints
 * @param {Array} data.bids - Array of bid objects
 * @param {Object} data.projects - Map of projects indexed by ID
 * @param {Object} data.users - Map of users indexed by ID
 * @param {Array} data.threads - Array of thread objects
 * @param {Array} data.milestones - Array of milestone objects
 * @returns {Array<Object>} - Array of unified data objects ready for display
 */
export function transformDataToRows({
  bids = [],
  projects = {},
  users = {},
  threads = [],
  milestones = [],
}) {
  // PROJECT DEBUG: Check if we have our target project in the input
  const targetBids = bids.filter((bid) => bid.project_id === 31584431);
  if (targetBids.length > 0) {
    console.log(
      `DEBUG - transformDataToRows: Found ${targetBids.length} bids for project 31584431`
    );

    // Check if we have milestone data for these bids
    targetBids.forEach((bid) => {
      const bidId = bid.bid_id || bid.id;
      console.log(
        `DEBUG - Bid ${bidId} for project 31584431 has ${
          (bid.milestones || []).length
        } milestones`
      );
      console.log(
        `DEBUG - Milestone data: ${JSON.stringify(bid.milestones || [])}`
      );
    });
  }

  // Create maps for efficient lookups
  const threadsByProject = threads.reduce((acc, thread) => {
    // Handle nested thread structure
    const contextObj = thread.thread?.context || thread.context;
    if (contextObj && contextObj.type === "project") {
      acc[contextObj.id] = thread;
    }
    return acc;
  }, {});

  // FIX: Replace milestones.reduce with safer implementation
  const milestonesByBid = {};
  if (Array.isArray(milestones)) {
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      if (!milestone || !milestone.bid_id) continue;

      // Handle both potential property names: bid_id from API and bid.id from transformed data
      const bidId = milestone.bid_id;
      if (!milestonesByBid[bidId]) {
        milestonesByBid[bidId] = [];
      }
      milestonesByBid[bidId].push(milestone);
    }
  }

  // Transform bids into rows with ALL requested fields
  return bids.map((bid) => {
    // PROJECT DEBUG: Focus on our target project
    if (bid.project_id === 31584431) {
      console.log(
        `DEBUG - transformDataToRows: Processing row for project 31584431`
      );

      // Log data sources
      const project = projects[bid.project_id] || {};
      const bidId = bid.bid_id || bid.id;
      const bidMilestones = bid.milestones || milestonesByBid[bidId] || [];

      console.log(
        `DEBUG - Project 31584431 details present: ${
          Object.keys(project).length > 0
        }`
      );
      console.log(
        `DEBUG - Bid ID: ${bidId}, Has milestones attached: ${
          (bid.milestones || []).length > 0
        }`
      );
      console.log(
        `DEBUG - Milestones from milestonesByBid: ${
          (milestonesByBid[bidId] || []).length
        }`
      );
      console.log(
        `DEBUG - Final milestone count being used: ${bidMilestones.length}`
      );
    }

    const project = projects[bid.project_id] || {};
    const client = users[bid.project_owner_id] || {};
    const thread = threadsByProject[bid.project_id];

    // FIX: Handle the case where bid.id might be used instead of bid.bid_id
    const bidId = bid.bid_id || bid.id;
    // FIX: Include both sources of milestones - directly attached to bid AND from milestonesByBid
    const bidMilestones = bid.milestones || milestonesByBid[bidId] || [];

    // Calculate response time if there's a thread
    const responseTime = thread
      ? (thread.thread?.time_created || thread.time_created) -
        bid.time_submitted
      : null;

    // FIX: Safely calculate total milestone amount without using reduce
    let totalMilestoneAmount = 0;
    if (Array.isArray(bidMilestones)) {
      for (let i = 0; i < bidMilestones.length; i++) {
        const milestone = bidMilestones[i];
        if (!milestone) continue;

        const amount =
          typeof milestone.amount === "number"
            ? milestone.amount
            : parseFloat(milestone.amount) || 0;

        totalMilestoneAmount += amount;
      }
    }

    // After calculating totalMilestoneAmount for our target project
    if (bid.project_id === 31584431) {
      console.log(
        `DEBUG - Final milestone amount for project 31584431: ${totalMilestoneAmount}`
      );
    }

    // Extract all required fields
    return {
      // Bid data
      bid_id: bidId,
      project_id: bid.project_id,
      project_title: project.title || `Project #${bid.project_id}`,
      project_url: `https://www.freelancer.com/projects/${bid.project_id}`,
      project_created: project.time_submitted,
      bid_amount: bid.amount,
      bid_time: bid.time_submitted,
      award_status: bid.award_status || "pending",
      awarded_time: bid.time_awarded,
      paid_amount: bid.paid_amount || 0,

      // Client data
      client_id: bid.project_owner_id,
      client_name:
        client.display_name ||
        client.username ||
        `Client #${bid.project_owner_id}`,
      client_url: client.username
        ? `https://www.freelancer.com/u/${client.username}`
        : null,
      client_country: client.location?.country?.name || "Unknown",
      client_rating: client.employer_reputation?.entire_history?.overall,
      client_payment_verified: client.status?.payment_verified || false,

      // Project data
      project_type: project.type === "hourly" ? "hourly" : "fixed",
      recruiter_project: project.hireme || false,
      min_budget: project.minimum_budget || project.budget?.minimum || null,
      max_budget: project.maximum_budget || project.budget?.maximum || null,
      total_bids: project.bid_stats?.bid_count,
      avg_bid: project.bid_stats?.bid_avg || project.bid_stats?.avg_bid || null,
      skills: project.jobs ? project.jobs.map((job) => job.name) : [],
      bid_proposal_link: `https://www.freelancer.com/projects/${bid.project_id}/proposals`,

      // Thread/message data
      received_response: !!thread,
      response_time: responseTime,
      first_message_time: thread?.thread?.time_created || thread?.time_created,

      // Milestone data
      milestones: Array.isArray(bidMilestones)
        ? bidMilestones.map((m) => ({
            amount: m.amount,
            time_created: m.time_created,
            status: m.status,
          }))
        : [],
      total_milestone_amount: totalMilestoneAmount,

      // Additional calculated fields
      time_to_bid: project.time_submitted
        ? bid.time_submitted - project.time_submitted
        : null,
      bid_to_award_time:
        bid.award_status === "awarded" && bid.time_awarded
          ? bid.time_awarded - bid.time_submitted
          : null,
      price_competitiveness:
        (project.bid_stats?.bid_avg || project.bid_stats?.avg_bid) && bid.amount
          ? (
              bid.amount /
              (project.bid_stats?.bid_avg || project.bid_stats?.avg_bid)
            ).toFixed(2)
          : null,
    };
  });
}

/**
 * Format epoch timestamp to locale string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleString();
}
