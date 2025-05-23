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
