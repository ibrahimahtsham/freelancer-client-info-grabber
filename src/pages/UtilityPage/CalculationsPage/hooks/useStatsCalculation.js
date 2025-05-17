import { useMemo } from "react";

export default function useStatsCalculation(rows) {
  // Calculate all statistics from row data
  const stats = useMemo(() => {
    if (!rows?.length) return null;

    // Helper to parse dates in DD-MM-YYYY format
    const parseDate = (dateString) => {
      if (!dateString || dateString === "N/A") return null;

      try {
        // If the date includes time, split and take just the date part
        const datePart = dateString.split(" ")[0];
        // Parse time part for hours
        const timePart = dateString.split(" ")[1];
        const ampm = dateString.split(" ")[2];

        // Parse DD-MM-YYYY format
        const [day, month, year] = datePart.split("-").map(Number);

        // Create date object
        const date = new Date(year, month - 1, day);

        // Add time if available
        if (timePart) {
          const [hours, minutes, seconds] = timePart.split(":").map(Number);
          let hour24 = hours;

          // Convert to 24-hour format if needed
          if (ampm && ampm.toUpperCase() === "PM" && hours < 12) {
            hour24 = hours + 12;
          } else if (ampm && ampm.toUpperCase() === "AM" && hours === 12) {
            hour24 = 0;
          }

          date.setHours(hour24, minutes || 0, seconds || 0);
        }

        return date;
      } catch {
        console.warn("Failed to parse date:", dateString);
        return null;
      }
    };

    // Total projects
    const totalProjects = rows.length;

    // Awarded projects
    const awardedProjects = rows.filter((row) => row.awarded === "Yes").length;
    const awardRate =
      totalProjects > 0
        ? ((awardedProjects / totalProjects) * 100).toFixed(2)
        : 0;

    // Total bid amount
    const totalBidAmount = rows.reduce((sum, row) => {
      const amount = parseFloat(row.yourBidAmount?.replace("$", "") || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Total paid amount
    const totalPaidAmount = rows.reduce((sum, row) => {
      const amount = parseFloat(row.totalPaidMilestones?.replace("$", "") || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Average bid amount
    const averageBidAmount =
      totalProjects > 0 ? totalBidAmount / totalProjects : 0;

    // Average paid amount per awarded project
    const averagePaidAmount =
      awardedProjects > 0 ? totalPaidAmount / awardedProjects : 0;

    // Projects with date information
    const projectsWithDates = rows.filter((row) => {
      const date = parseDate(row.projectUploadDate);
      return date !== null;
    });

    // Time-based statistics
    const timeStats = {
      morning: {
        total: 0,
        awarded: 0,
        paid: 0,
      },
      afternoon: {
        total: 0,
        awarded: 0,
        paid: 0,
      },
      evening: {
        total: 0,
        awarded: 0,
        paid: 0,
      },
      night: {
        total: 0,
        awarded: 0,
        paid: 0,
      },
    };

    // Process each project for time-based stats
    projectsWithDates.forEach((row) => {
      const date = parseDate(row.projectUploadDate);
      const hour = date.getHours();
      const isAwarded = row.awarded === "Yes";
      const paidAmount = parseFloat(
        row.totalPaidMilestones?.replace("$", "") || 0
      );

      // Categorize by time of day
      if (hour >= 6 && hour < 12) {
        timeStats.morning.total++;
        if (isAwarded) timeStats.morning.awarded++;
        timeStats.morning.paid += paidAmount;
      } else if (hour >= 12 && hour < 17) {
        timeStats.afternoon.total++;
        if (isAwarded) timeStats.afternoon.awarded++;
        timeStats.afternoon.paid += paidAmount;
      } else if (hour >= 17 && hour < 21) {
        timeStats.evening.total++;
        if (isAwarded) timeStats.evening.awarded++;
        timeStats.evening.paid += paidAmount;
      } else {
        timeStats.night.total++;
        if (isAwarded) timeStats.night.awarded++;
        timeStats.night.paid += paidAmount;
      }
    });

    // Return the calculated stats
    return {
      totalProjects,
      awardedProjects,
      awardRate,
      totalBidAmount,
      totalPaidAmount,
      averageBidAmount,
      averagePaidAmount,
      projectsWithDates: projectsWithDates.length,
      timeStats,
    };
  }, [rows]);

  return { stats, timeStats: stats?.timeStats };
}
