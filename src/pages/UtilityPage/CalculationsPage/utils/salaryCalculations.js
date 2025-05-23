import {
  parseProjectDateTime,
  to24Hour,
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
 * Calculate salary data for the employee based on their shift data and projects
 */
export const calculateSalary = ({
  employee,
  projects,
  baseSalary,
  commissionTiers,
  perfectAttendance,
  attendanceBonus,
  qualityBonus,
  usdToPkrRate,
  periodMonths,
}) => {
  if (!employee || !projects?.length) {
    return {
      baseSalaryUSD: 0,
      baseSalaryPKR: 0,
      commissionUSD: 0,
      commissionPKR: 0,
      attendanceBonusUSD: 0,
      attendanceBonusPKR: 0,
      qualityBonusUSD: 0,
      qualityBonusPKR: 0,
      totalCompensationUSD: 0,
      totalCompensationPKR: 0,
      totalProjects: 0,
      awardedProjects: 0,
      totalSalesUSD: 0,
      monthlySalesUSD: 0,
      periodMonths,
    };
  }

  // Convert shift times to 24-hour format
  const shiftStart = to24Hour(employee.startHour, employee.startAmPm);
  const shiftEnd = to24Hour(employee.endHour, employee.endAmPm);

  // Filter projects that fall within the employee's shift
  const personProjects = projects.filter((project) => {
    // Handle different date formats from new data structure
    let projectDateTime;

    // Try to parse bid_time first (new structure)
    if (project.bid_time) {
      projectDateTime = parseProjectDateTime(project.bid_time);
    }

    // Fall back to old structure if needed
    if (!projectDateTime && project.projectUploadDate) {
      projectDateTime = parseProjectDateTime(project.projectUploadDate);
    }

    // Skip projects with invalid dates
    if (!projectDateTime) return false;

    const projectHour = projectDateTime.getHours();

    // Handle shifts that span across midnight
    if (shiftStart <= shiftEnd) {
      return projectHour >= shiftStart && projectHour < shiftEnd;
    } else {
      return projectHour >= shiftStart || projectHour < shiftEnd;
    }
  });

  // Count awarded projects and total sales
  const totalProjects = personProjects.length;
  const awardedProjects = personProjects.filter(
    (project) => project.award_status === "awarded" || project.awarded === "Yes"
  ).length;

  // Calculate total sales (using bid_amount from new structure or yourBidAmount from old)
  const totalSales = personProjects.reduce((sum, project) => {
    if (project.award_status === "awarded" || project.awarded === "Yes") {
      // Try new structure first
      if (project.bid_amount) {
        return sum + (parseFloat(project.bid_amount) || 0);
      }

      // Fall back to old structure
      if (project.yourBidAmount) {
        const bidAmount =
          parseFloat(project.yourBidAmount.replace("$", "")) || 0;
        return sum + bidAmount;
      }
    }
    return sum;
  }, 0);

  // Convert total sales to monthly sales based on calculation period
  const monthlySales = totalSales / (periodMonths || 1);

  // Calculate commissions based on tiered rates
  const calculateCommission = (sales) => {
    let commission = 0;

    // Tier 1: $0-$1000
    const tier1Limit = Math.min(sales, commissionTiers.tier1.max);
    commission += tier1Limit * (commissionTiers.tier1.rate / 100);

    // Tier 2: $1001-$2500
    if (sales > commissionTiers.tier2.min) {
      const tier2Amount = Math.min(
        sales - commissionTiers.tier2.min,
        commissionTiers.tier2.max - commissionTiers.tier2.min
      );
      commission += tier2Amount * (commissionTiers.tier2.rate / 100);
    }

    // Tier 3: $2501-$5000
    if (sales > commissionTiers.tier3.min) {
      const tier3Amount = Math.min(
        sales - commissionTiers.tier3.min,
        commissionTiers.tier3.max - commissionTiers.tier3.min
      );
      commission += tier3Amount * (commissionTiers.tier3.rate / 100);
    }

    // Tier 4: $5001+
    if (sales > commissionTiers.tier4.min) {
      const tier4Amount = sales - commissionTiers.tier4.min;
      commission += tier4Amount * (commissionTiers.tier4.rate / 100);
    }

    return commission;
  };

  // Calculate commission for the total sales
  const commissionUSD = calculateCommission(totalSales);

  // Calculate base salary for the period
  const baseSalaryForPeriod = baseSalary * periodMonths;

  // Calculate bonuses
  const attendanceBonusUSD = perfectAttendance
    ? attendanceBonus * periodMonths
    : 0;
  const qualityBonusUSD = qualityBonus * periodMonths;

  // Calculate total compensation
  const totalCompensationUSD =
    baseSalaryForPeriod + commissionUSD + attendanceBonusUSD + qualityBonusUSD;

  // Convert to PKR
  const toPKR = (usd) => usd * usdToPkrRate;

  return {
    baseSalaryUSD: baseSalaryForPeriod,
    baseSalaryPKR: toPKR(baseSalaryForPeriod),
    commissionUSD,
    commissionPKR: toPKR(commissionUSD),
    attendanceBonusUSD,
    attendanceBonusPKR: toPKR(attendanceBonusUSD),
    qualityBonusUSD,
    qualityBonusPKR: toPKR(qualityBonusUSD),
    totalCompensationUSD,
    totalCompensationPKR: toPKR(totalCompensationUSD),
    totalProjects,
    awardedProjects,
    totalSalesUSD: totalSales,
    monthlySalesUSD: monthlySales,
    periodMonths,
  };
};
