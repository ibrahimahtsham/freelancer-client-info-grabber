import {
  parseProjectDateTime,
  isInShift,
} from "../../../../utils/projectTimeUtils";

/**
 * Calculate commission based on tiered structure
 * @param {number} monthlySales - Monthly sales amount in USD
 * @param {object} tiers - Commission tier configuration
 * @returns {number} - Total commission amount in USD
 */
export function calculateTieredCommission(monthlySales, tiers) {
  let commission = 0;

  // Tier 1
  if (monthlySales >= tiers.tier1.min) {
    const tier1Amount =
      Math.min(tiers.tier1.max, monthlySales) - tiers.tier1.min + 1;
    commission += tier1Amount > 0 ? tier1Amount * (tiers.tier1.rate / 100) : 0;
  }

  // Tier 2
  if (monthlySales >= tiers.tier2.min) {
    const tier2Amount =
      Math.min(tiers.tier2.max, monthlySales) - tiers.tier2.min + 1;
    commission += tier2Amount > 0 ? tier2Amount * (tiers.tier2.rate / 100) : 0;
  }

  // Tier 3
  if (monthlySales >= tiers.tier3.min) {
    const tier3Amount =
      Math.min(tiers.tier3.max, monthlySales) - tiers.tier3.min + 1;
    commission += tier3Amount > 0 ? tier3Amount * (tiers.tier3.rate / 100) : 0;
  }

  // Tier 4
  if (monthlySales >= tiers.tier4.min) {
    const tier4Amount = monthlySales - tiers.tier4.min + 1;
    commission += tier4Amount > 0 ? tier4Amount * (tiers.tier4.rate / 100) : 0;
  }

  return commission;
}

/**
 * Calculate full salary breakdown - all in USD with optional PKR values
 * @param {object} params - Calculation parameters
 * @returns {object|null} - Salary data object or null if data insufficient
 */
export function calculateSalary(params) {
  const {
    rows,
    selectedEmployee,
    baseSalary,
    commissionTiers,
    usdToPkrRate,
    calculationPeriodMonths,
    perfectAttendance,
    attendanceBonus,
    qualityBonus,
  } = params;

  if (!rows?.length || !selectedEmployee) return null;

  // Filter projects by employee's shift
  const personProjects = rows.filter((row) => {
    const hour = parseProjectDateTime(row.projectUploadDate);
    return isInShift(
      hour,
      selectedEmployee.startHour24,
      selectedEmployee.endHour24
    );
  });

  // Get awarded projects
  const awardedProjects = personProjects.filter((row) => row.awarded === "Yes");

  // Calculate total paid amount
  const totalPaid = personProjects.reduce((sum, row) => {
    // Remove $ and any commas, then parse
    const cleanValue = row.totalPaidMilestones?.replace(/[$,]/g, "") || "0";
    const amount = parseFloat(cleanValue);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Calculate monthly sales
  const monthlySales = totalPaid / calculationPeriodMonths;

  // Calculate commission
  const commission =
    calculateTieredCommission(monthlySales, commissionTiers) *
    calculationPeriodMonths;

  // Calculate bonuses
  const attendanceBonusValue = perfectAttendance
    ? attendanceBonus * calculationPeriodMonths
    : 0;
  const qualityBonusValue = qualityBonus * calculationPeriodMonths;

  // Calculate totals
  const baseSalaryForPeriod = baseSalary * calculationPeriodMonths;
  const totalCompensation =
    baseSalaryForPeriod + commission + attendanceBonusValue + qualityBonusValue;

  // Include PKR values for display purposes
  const pkrValues = {
    baseSalaryPKR: baseSalaryForPeriod * usdToPkrRate,
    commissionPKR: commission * usdToPkrRate,
    attendanceBonusPKR: attendanceBonusValue * usdToPkrRate,
    qualityBonusPKR: qualityBonusValue * usdToPkrRate,
    totalCompensationPKR: totalCompensation * usdToPkrRate,
  };

  return {
    totalProjects: personProjects.length,
    awardedProjects: awardedProjects.length,
    totalSalesUSD: totalPaid,
    monthlySalesUSD: monthlySales,
    baseSalaryUSD: baseSalaryForPeriod,
    commissionUSD: commission,
    attendanceBonusUSD: attendanceBonusValue,
    qualityBonusUSD: qualityBonusValue,
    totalCompensationUSD: totalCompensation,
    periodMonths: calculationPeriodMonths,
    usdToPkrRate,
    ...pkrValues,
  };
}
