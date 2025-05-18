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
      const awardedProjects = rows.filter(
        (row) => row.awarded === "Yes"
      ).length;
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
        const amount = parseFloat(
          row.totalPaidMilestones?.replace("$", "") || 0
        );
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

      return {
        totalProjects,
        awardedProjects,
        awardRate,
        totalBidAmount,
        totalPaidAmount,
        averageBidAmount,
        averagePaidAmount,
        projectsWithDates: projectsWithDates.length,
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
        // Parse project date time
        const dateString = row.projectUploadDate;
        if (!dateString || dateString === "N/A") return;

        try {
          // Parse DD-MM-YYYY HH:MM:SS AM/PM format
          const parts = dateString.split(" ");
          if (parts.length < 3) return;

          const timePart = parts[1];
          const ampmPart = parts[2];

          // Parse time
          const [hours] = timePart.split(":").map(Number);

          // Convert to 24-hour format
          let hour = hours;
          if (ampmPart === "PM" && hours < 12) hour += 12;
          else if (ampmPart === "AM" && hours === 12) hour = 0;

          // Determine time period
          let period;
          if (hour >= 6 && hour < 12) period = "morning";
          else if (hour >= 12 && hour < 17) period = "afternoon";
          else if (hour >= 17 && hour < 21) period = "evening";
          else period = "night"; // 21-6

          // Update counts
          stats[period].total += 1;

          // Update awarded count
          if (row.awarded === "Yes") {
            stats[period].awarded += 1;

            // Parse and add paid amount - IMPROVED PARSING
            let paidAmount = 0;
            if (row.totalPaidMilestones) {
              // Remove $ and any commas, then parse
              const cleanValue = row.totalPaidMilestones.replace(/[$,]/g, "");
              paidAmount = parseFloat(cleanValue) || 0;
            }
            stats[period].paid += paidAmount;
          }
        } catch (err) {
          console.warn("Error parsing date:", dateString, err);
          return;
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
