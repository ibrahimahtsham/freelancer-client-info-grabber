import { to24Hour } from "../../../../utils/dateUtils";

/**
 * Calculate tiered commission based on sales amount
 * @param {number} amount - Sales amount in USD
 * @returns {number} - Commission amount in USD
 */
export function calculateCommission(amount) {
  let commission = 0;

  // 3% upon $1,000 to $2,500
  if (amount >= 1000) {
    const tier1Amount = Math.min(amount, 2500) - 1000;
    commission += tier1Amount > 0 ? tier1Amount * 0.03 : 0;
  }

  // 5% upon $2,501 to $6,000
  if (amount > 2500) {
    const tier2Amount = Math.min(amount, 6000) - 2500;
    commission += tier2Amount > 0 ? tier2Amount * 0.05 : 0;
  }

  // 7% upon $6,001 to $9,999
  if (amount > 6000) {
    const tier3Amount = Math.min(amount, 9999) - 6000;
    commission += tier3Amount > 0 ? tier3Amount * 0.07 : 0;
  }

  // 10% upon $10,000+
  if (amount >= 10000) {
    const tier4Amount = amount - 10000;
    commission += tier4Amount > 0 ? tier4Amount * 0.1 : 0;
  }

  return commission;
}

/**
 * Calculate salary data for the employee based on their shift and projects
 */
export const calculateSalary = ({
  rows,
  selectedEmployee,
  baseSalary,
  calculationPeriodMonths,
  perfectAttendance,
  qualityBonus,
}) => {
  // Return empty data if no employee or rows
  if (!selectedEmployee || !rows?.length) {
    return {
      baseSalaryUSD: 0,
      commissionUSD: 0,
      attendanceBonusUSD: 0,
      qualityBonusUSD: 0,
      processAssistBonusUSD: 0,
      consistencyBonusUSD: 0,
      leadershipBonusUSD: 0,
      salesMaturityBonusUSD: 0,
      totalCompensationUSD: 0,
      totalProjects: 0,
      awardedProjects: 0,
      totalSalesUSD: 0,
      paidSalesUSD: 0,
      monthlySalesUSD: 0,
      periodMonths: calculationPeriodMonths || 1,
    };
  }

  // Convert shift times to 24-hour format
  const shiftStart =
    selectedEmployee.startHour24 ||
    to24Hour(selectedEmployee.startHour, selectedEmployee.startAmPm);
  const shiftEnd =
    selectedEmployee.endHour24 ||
    to24Hour(selectedEmployee.endHour, selectedEmployee.endAmPm);

  // Filter projects that fall within the employee's shift
  const employeeProjects = rows.filter((row) => {
    // Skip if no bid_time available
    if (!row.bid_time) return false;

    // Convert Unix timestamp to Date
    const date = new Date(row.bid_time * 1000);
    const hour = date.getHours();

    // Check if hour is within shift
    if (shiftStart <= shiftEnd) {
      return hour >= shiftStart && hour < shiftEnd;
    } else {
      // Handle overnight shifts
      return hour >= shiftStart || hour < shiftEnd;
    }
  });

  // Count total and awarded projects
  const totalProjects = employeeProjects.length;

  // Get awarded projects
  const awardedProjects = employeeProjects.filter(
    (project) => project.award_status === "awarded"
  );

  // Calculate total bid amounts (contract value)
  const totalBidAmount = awardedProjects.reduce((sum, project) => {
    return sum + (parseFloat(project.bid_amount) || 0);
  }, 0);

  // Calculate paid amount (released funds)
  const totalPaidAmount = awardedProjects.reduce((sum, project) => {
    return sum + (parseFloat(project.paid_amount) || 0);
  }, 0);

  // Calculate monthly averages
  const monthlySales = totalBidAmount / (calculationPeriodMonths || 1);
  const monthlyPaidSales = totalPaidAmount / (calculationPeriodMonths || 1);

  // Base salary for the period
  const baseSalaryUSD = baseSalary * calculationPeriodMonths;

  // Sales maturity bonus (based on contract date)
  const salesMaturityBonusUSD =
    monthlySales >= 1000 ? 35 * calculationPeriodMonths : 0; // Approx $35 USD = 10,000 PKR

  // Commission on paid amounts (released funds)
  const commissionUSD =
    calculateCommission(monthlyPaidSales) * calculationPeriodMonths;

  // Attendance bonus
  const attendanceBonusUSD = perfectAttendance
    ? 17 * calculationPeriodMonths
    : 0; // Approx $17 USD = 5,000 PKR

  // Quality bonus (from UI input)
  const qualityBonusUSD = qualityBonus * calculationPeriodMonths;

  // Process assist bonus (simplified, from UI or could be a parameter)
  const processAssistBonusUSD = 0; // Would need additional tracking to implement

  // Consistency bonus (if maintaining $2,500+ for 3+ months)
  const consistencyBonusUSD =
    calculationPeriodMonths >= 3 && monthlySales >= 2500
      ? 85 * calculationPeriodMonths
      : 0; // Approx $85 USD = 25,000 PKR

  // Leadership bonus (simplified, would need subordinate data)
  const leadershipBonusUSD = 0; // Would need additional data to implement

  // Calculate total compensation
  const totalCompensationUSD =
    baseSalaryUSD +
    commissionUSD +
    attendanceBonusUSD +
    qualityBonusUSD +
    processAssistBonusUSD +
    consistencyBonusUSD +
    leadershipBonusUSD +
    salesMaturityBonusUSD;

  return {
    baseSalaryUSD,
    commissionUSD,
    attendanceBonusUSD,
    qualityBonusUSD,
    processAssistBonusUSD,
    consistencyBonusUSD,
    leadershipBonusUSD,
    salesMaturityBonusUSD,
    totalCompensationUSD,
    totalProjects,
    awardedProjects: awardedProjects.length,
    totalSalesUSD: totalBidAmount,
    paidSalesUSD: totalPaidAmount,
    monthlySalesUSD: monthlySales,
    periodMonths: calculationPeriodMonths,
  };
};
