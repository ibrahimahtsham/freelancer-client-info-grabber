import { to24Hour } from "../../../../../../utils/dateUtils";

export const calculateTeamStats = (rows, employees) => {
  if (!rows || !rows.length || !employees || employees.length < 2) {
    return null;
  }

  // We'll work with the first two employees in the list
  const firstEmployee = employees[0];
  const secondEmployee = employees[1];

  if (!firstEmployee || !secondEmployee) return null;

  // Get shift data from employees
  const firstShift = {
    start: to24Hour(firstEmployee.startHour, firstEmployee.startAmPm),
    end: to24Hour(firstEmployee.endHour, firstEmployee.endAmPm),
    name: firstEmployee.name,
    id: firstEmployee.id,
  };

  const secondShift = {
    start: to24Hour(secondEmployee.startHour, secondEmployee.startAmPm),
    end: to24Hour(secondEmployee.endHour, secondEmployee.endAmPm),
    name: secondEmployee.name,
    id: secondEmployee.id,
  };

  // Use IDs as keys for stats tracking
  const firstId = firstEmployee.id;
  const secondId = secondEmployee.id;

  // Helper function to parse date/time from both old and new data structure
  const parseDateTime = (row) => {
    // First try new data structure with bid_time (Unix timestamp)
    if (row.bid_time) {
      try {
        const date = new Date(row.bid_time * 1000);
        return {
          hour: date.getHours(),
          date: date,
        };
      } catch (err) {
        console.warn("Failed to parse bid_time:", row.bid_time, err);
      }
    }

    // Fall back to old structure with projectUploadDate (DD-MM-YYYY HH:MM:SS AM/PM)
    if (row.projectUploadDate && row.projectUploadDate !== "N/A") {
      try {
        // Parse DD-MM-YYYY HH:MM:SS AM/PM format
        const parts = row.projectUploadDate.split(" ");
        if (parts.length < 2) return null;

        const datePart = parts[0];
        const timePart = parts[1];
        const ampmPart = parts[2];

        // Parse date
        const [day, month, year] = datePart.split("-").map(Number);

        // Parse time
        const [hours, minutes] = timePart.split(":").map(Number);

        // Convert to 24-hour format
        let hour24 = hours;
        if (ampmPart === "PM" && hours < 12) hour24 += 12;
        else if (ampmPart === "AM" && hours === 12) hour24 = 0;

        return {
          hour: hour24,
          date: new Date(year, month - 1, day, hour24, minutes),
        };
      } catch (e) {
        console.warn(
          "Failed to parse projectUploadDate:",
          row.projectUploadDate,
          e
        );
      }
    }

    return null;
  };

  // Check if time falls within a shift
  const isInShift = (hour, shift) => {
    if (hour === null) return false;

    // Handle shifts that span across midnight
    if (shift.start > shift.end) {
      return hour >= shift.start || hour < shift.end;
    } else {
      return hour >= shift.start && hour < shift.end;
    }
  };

  // Initialize stats object using employee IDs
  const stats = {};
  stats[firstId] = {
    total: 0,
    awarded: 0,
    totalBid: 0,
    totalPaid: 0,
    name: firstEmployee.name,
  };

  stats[secondId] = {
    total: 0,
    awarded: 0,
    totalBid: 0,
    totalPaid: 0,
    name: secondEmployee.name,
  };

  // Process each row
  rows.forEach((row) => {
    const dateTime = parseDateTime(row);
    if (!dateTime) return;

    // Check which shift the project belongs to
    let employeeId = null;

    if (isInShift(dateTime.hour, firstShift)) {
      employeeId = firstId;
    } else if (isInShift(dateTime.hour, secondShift)) {
      employeeId = secondId;
    } else {
      // Outside both shifts, skip
      return;
    }

    // Update stats
    stats[employeeId].total++;

    // Check if awarded - handle both new and old data structures
    const isAwarded = row.award_status === "awarded" || row.awarded === "Yes";

    if (isAwarded) {
      stats[employeeId].awarded++;
    }

    // Parse bid amount - handle both data structures
    let bidAmount = 0;

    if (row.bid_amount !== undefined) {
      // New structure
      bidAmount = parseFloat(row.bid_amount) || 0;
    } else if (row.yourBidAmount) {
      // Old structure
      bidAmount = parseFloat(row.yourBidAmount.replace("$", "")) || 0;
    }

    stats[employeeId].totalBid += bidAmount;

    // Parse paid amount - handle both data structures
    let paidAmount = 0;

    if (row.paid_amount !== undefined) {
      // New structure
      paidAmount = parseFloat(row.paid_amount) || 0;
    } else if (row.totalPaidMilestones) {
      // Old structure
      paidAmount = parseFloat(row.totalPaidMilestones.replace("$", "")) || 0;
    }

    stats[employeeId].totalPaid += paidAmount;
  });

  // Calculate derived stats
  const calculate = (employeeId) => {
    const s = stats[employeeId];
    return {
      ...s,
      awardRate: s.total > 0 ? ((s.awarded / s.total) * 100).toFixed(1) : 0,
      avgBid: s.total > 0 ? (s.totalBid / s.total).toFixed(2) : 0,
      avgPaid: s.awarded > 0 ? (s.totalPaid / s.awarded).toFixed(2) : 0,
    };
  };

  // Return results with employee IDs as keys
  const result = {};
  result[firstId] = calculate(firstId);
  result[secondId] = calculate(secondId);

  return result;
};
