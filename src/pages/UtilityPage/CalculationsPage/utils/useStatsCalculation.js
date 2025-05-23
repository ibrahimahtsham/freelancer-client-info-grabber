import { useState, useEffect } from "react";

const useStatsCalculation = (rows) => {
  const [stats, setStats] = useState(null);
  const [timeStats, setTimeStats] = useState(null);

  useEffect(() => {
    if (!rows || rows.length === 0) {
      setStats(null);
      setTimeStats(null);
      return;
    }

    // Calculate basic stats
    const calculateStats = () => {
      if (!rows?.length) return null;

      // Total projects
      const totalProjects = rows.length;

      // Awarded projects
      const awardedProjects = rows.filter(
        (row) => row.award_status === "awarded"
      ).length;

      const awardRate =
        totalProjects > 0
          ? ((awardedProjects / totalProjects) * 100).toFixed(2)
          : 0;

      // Total bid amount
      const totalBidAmount = rows.reduce((sum, row) => {
        return sum + (row.bid_amount || 0);
      }, 0);

      // Total paid amount
      const totalPaidAmount = rows.reduce((sum, row) => {
        return sum + (row.paid_amount || 0);
      }, 0);

      // Average bid amount
      const averageBidAmount =
        totalProjects > 0 ? totalBidAmount / totalProjects : 0;

      // Average paid amount per awarded project
      const averagePaidAmount =
        awardedProjects > 0 ? totalPaidAmount / awardedProjects : 0;

      return {
        totalProjects,
        awardedProjects,
        awardRate,
        totalBidAmount,
        totalPaidAmount,
        averageBidAmount,
        averagePaidAmount,
      };
    };

    // Calculate time distribution stats
    const calculateTimeStats = () => {
      const stats = {
        morning: { total: 0, awarded: 0, paid: 0 },
        afternoon: { total: 0, awarded: 0, paid: 0 },
        evening: { total: 0, awarded: 0, paid: 0 },
        night: { total: 0, awarded: 0, paid: 0 },
      };

      rows.forEach((row) => {
        // Use bid_time timestamp for the calculations
        if (!row.bid_time) return;

        try {
          const date = new Date(row.bid_time * 1000); // Convert timestamp to Date
          const hour = date.getHours();

          // Determine time period
          let period;
          if (hour >= 6 && hour < 12) period = "morning";
          else if (hour >= 12 && hour < 17) period = "afternoon";
          else if (hour >= 17 && hour < 21) period = "evening";
          else period = "night"; // 21-6

          // Update counts
          stats[period].total += 1;

          // Update awarded count
          if (row.award_status === "awarded") {
            stats[period].awarded += 1;
            stats[period].paid += row.paid_amount || 0;
          }
        } catch (err) {
          console.warn("Error processing date:", err);
        }
      });

      return stats;
    };

    setStats(calculateStats());
    setTimeStats(calculateTimeStats());
  }, [rows]);

  return { stats, timeStats };
};

export default useStatsCalculation;
