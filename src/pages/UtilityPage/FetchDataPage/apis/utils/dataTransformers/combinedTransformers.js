import { formatTimestamp } from "./utils";

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
      // New client fields
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
      milestone_count: Array.isArray(bidMilestones) ? bidMilestones.length : 0,
      total_milestone_amount: totalMilestoneAmount,
      milestone_payments: Array.isArray(bidMilestones)
        ? bidMilestones.map((m) => ({
            amount: m.amount,
            date: m.time_created,
            formatted_date: formatTimestamp(m.time_created),
            reason: m.other_reason || m.reason || "",
            status: m.status,
          }))
        : [],
      milestone_summary:
        Array.isArray(bidMilestones) && bidMilestones.length > 0
          ? bidMilestones
              .map(
                (m) =>
                  `$${parseFloat(m.amount).toFixed(2)} (${
                    formatTimestamp(m.time_created).split(",")[0]
                  })`
              )
              .join(", ")
          : "No milestones",

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
