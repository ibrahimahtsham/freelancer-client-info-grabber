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
    console.log("Missing client data structure:", clientData);
    return bids;
  }

  const clients = clientData.result.users;
  console.log("Client data available for IDs:", Object.keys(clients));

  return bids.map((bid) => {
    const client = clients[bid.client_id];

    if (!client) {
      console.log("No client data found for client_id:", bid.client_id);
      return bid;
    }

    // Extract more detailed information from client data
    return {
      ...bid,
      client_country: client.location?.country?.name || null,
      client_rating:
        client.employer_reputation?.entire_history?.overall || null,
      client_payment_verified: client.status?.payment_verified || false,
      // New fields to extract
      client_email_verified: client.status?.email_verified || false,
      client_identity_verified: client.status?.identity_verified || false,
      client_phone_verified: client.status?.phone_verified || false,
      client_deposit_made: client.status?.deposit_made || false,
      client_profile_complete: client.status?.profile_complete || false,
      client_total_reviews:
        client.employer_reputation?.entire_history?.reviews || 0,
      client_total_projects:
        client.employer_reputation?.entire_history?.complete || 0,
      client_registration_date: client.registration_date || null,
      client_badges: client.badges
        ? client.badges.map((badge) => badge.name)
        : [],
      client_primary_language: client.primary_language || null,
      client_company: client.company || null,
    };
  });
}
