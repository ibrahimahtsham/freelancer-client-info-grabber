import { useState } from "react";

export function useSalaryCalculation() {
  // Base parameters - all in USD
  const [baseSalary, setBaseSalary] = useState(180);
  const [calculationPeriodMonths, setCalculationPeriodMonths] = useState(1);

  // Commission tiers in USD
  const [commissionTiers, setCommissionTiers] = useState({
    tier1: { min: 1000, max: 2500, rate: 3 },
    tier2: { min: 2501, max: 6000, rate: 5 },
    tier3: { min: 6001, max: 9999, rate: 7 },
    tier4: { min: 10000, max: Infinity, rate: 10 },
  });

  // Bonus parameters in USD
  const [attendanceBonus, setAttendanceBonus] = useState(17); // ~$17 USD = 5,000 PKR
  const [perfectAttendance, setPerfectAttendance] = useState(true);
  const [qualityBonus, setQualityBonus] = useState(35); // ~$35 USD = 10,000 PKR

  // Update a specific tier's rate
  const updateTierRate = (tierName, newRate) => {
    setCommissionTiers((prev) => ({
      ...prev,
      [tierName]: { ...prev[tierName], rate: newRate },
    }));
  };

  // Reset all parameters to default values
  const resetToDefaults = () => {
    setBaseSalary(180);
    setCalculationPeriodMonths(1);
    setCommissionTiers({
      tier1: { min: 1000, max: 2500, rate: 3 },
      tier2: { min: 2501, max: 6000, rate: 5 },
      tier3: { min: 6001, max: 9999, rate: 7 },
      tier4: { min: 10000, max: Infinity, rate: 10 },
    });
    setAttendanceBonus(17);
    setPerfectAttendance(true);
    setQualityBonus(35);
  };

  return {
    baseSalary,
    setBaseSalary,
    calculationPeriodMonths,
    setCalculationPeriodMonths,
    commissionTiers,
    updateTierRate,
    attendanceBonus,
    setAttendanceBonus,
    perfectAttendance,
    setPerfectAttendance,
    qualityBonus,
    setQualityBonus,
    resetToDefaults,
  };
}

export default useSalaryCalculation;
