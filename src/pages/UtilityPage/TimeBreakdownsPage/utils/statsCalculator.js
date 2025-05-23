/**
 * Calculate employee stats based on projects data
 * @param {Array} awardedProjects - Array of awarded projects
 * @param {Array} otherProjects - Array of non-awarded projects
 * @returns {Object} Object containing calculated statistics
 */
export function calculateEmployeeStats(awardedProjects, otherProjects) {
  // Calculate win rate
  const winRate =
    awardedProjects.length > 0 || otherProjects.length > 0
      ? (
          (awardedProjects.length /
            (awardedProjects.length + otherProjects.length)) *
          100
        ).toFixed(1)
      : 0;

  // Calculate total bid amount
  const totalBidAmount = awardedProjects.reduce(
    (sum, project) => sum + (parseFloat(project.bid_amount) || 0),
    0
  );

  // Calculate total paid amount
  const totalPaidAmount = awardedProjects.reduce(
    (sum, project) => sum + (parseFloat(project.paid_amount) || 0),
    0
  );

  return {
    winRate,
    totalBidAmount,
    totalPaidAmount,
  };
}
