import { format } from "date-fns";
import { to24Hour } from "../../../../../../utils/dateUtils";

export const processHeatmapData = (rows, employees, startDate, endDate) => {
  if (!rows?.length || !employees?.length >= 2) {
    return {
      employee1: { bids: [], time: [] },
      employee2: { bids: [], time: [] },
    };
  }

  const firstEmployee = employees[0];
  const secondEmployee = employees[1];

  // Get shift data from employees
  const firstShift = {
    start: to24Hour(firstEmployee.startHour, firstEmployee.startAmPm),
    end: to24Hour(firstEmployee.endHour, firstEmployee.endAmPm),
    id: firstEmployee.id,
  };

  const secondShift = {
    start: to24Hour(secondEmployee.startHour, secondEmployee.startAmPm),
    end: to24Hour(secondEmployee.endHour, secondEmployee.endAmPm),
    id: secondEmployee.id,
  };

  // Helper function to check if time falls within a shift
  const isInShift = (hour, shift) => {
    if (hour === null) return false;

    // Handle shifts that span across midnight
    if (shift.start > shift.end) {
      return hour >= shift.start || hour < shift.end;
    } else {
      return hour >= shift.start && hour < shift.end;
    }
  };

  // Initialize data structures for both employees
  const employee1Data = { bids: {}, time: {} };
  const employee2Data = { bids: {}, time: {} };

  // Process each row
  rows.forEach((row) => {
    if (!row.bid_time) return;

    try {
      const bidDate = new Date(row.bid_time * 1000);
      const dateStr = format(bidDate, "yyyy-MM-dd");
      const hour = bidDate.getHours();

      // Check if the bid falls within our date range
      if (bidDate < startDate || bidDate > endDate) return;

      // Determine which employee's shift this belongs to
      let targetData = null;
      if (isInShift(hour, firstShift)) {
        targetData = employee1Data;
      } else if (isInShift(hour, secondShift)) {
        targetData = employee2Data;
      } else {
        return; // Outside both shifts
      }

      // Initialize date entries if they don't exist
      if (!targetData.bids[dateStr]) {
        targetData.bids[dateStr] = {
          count: 0,
          timeToBidSum: 0,
          timeToBidCount: 0,
          avgTimeToBid: 0,
        };
      }

      if (!targetData.time[dateStr]) {
        targetData.time[dateStr] = {
          times: [],
          count: 0,
          minTime: Infinity,
          maxTime: 0,
          bidCount: 0,
        };
      }

      // Update bid count
      targetData.bids[dateStr].count++;

      // Update time to bid data
      const timeToBid = row.time_to_bid || 0;
      if (timeToBid > 0) {
        targetData.bids[dateStr].timeToBidSum += timeToBid;
        targetData.bids[dateStr].timeToBidCount++;
        targetData.bids[dateStr].avgTimeToBid =
          targetData.bids[dateStr].timeToBidSum /
          targetData.bids[dateStr].timeToBidCount;

        // Update time-focused data
        targetData.time[dateStr].times.push(timeToBid);
        targetData.time[dateStr].bidCount++;
        targetData.time[dateStr].minTime = Math.min(
          targetData.time[dateStr].minTime,
          timeToBid
        );
        targetData.time[dateStr].maxTime = Math.max(
          targetData.time[dateStr].maxTime,
          timeToBid
        );

        // Calculate average time to bid for this date
        const avgTime =
          targetData.time[dateStr].times.reduce((sum, time) => sum + time, 0) /
          targetData.time[dateStr].times.length;
        targetData.time[dateStr].count = avgTime;
      }
    } catch (error) {
      console.warn("Error processing row:", row, error);
    }
  });

  // Convert to array format needed for CalendarHeatmap
  const convertToHeatmapFormat = (dataObj, mode) => {
    return Object.entries(dataObj).map(([date, data]) => ({
      date,
      count: mode === "bids" ? data.count : data.count,
      avgTimeToBid: mode === "bids" ? data.avgTimeToBid : undefined,
      minTime:
        mode === "time"
          ? data.minTime === Infinity
            ? 0
            : data.minTime
          : undefined,
      maxTime: mode === "time" ? data.maxTime : undefined,
      bidCount: mode === "time" ? data.bidCount : undefined,
    }));
  };

  return {
    employee1: {
      bids: convertToHeatmapFormat(employee1Data.bids, "bids"),
      time: convertToHeatmapFormat(employee1Data.time, "time"),
    },
    employee2: {
      bids: convertToHeatmapFormat(employee2Data.bids, "bids"),
      time: convertToHeatmapFormat(employee2Data.time, "time"),
    },
  };
};
