import { useState, useEffect } from "react";
import { Box, Typography, Grid, Alert, Paper } from "@mui/material";
import { useEmployees } from "../../../../../contexts/EmployeeHooks";
import { to24Hour } from "../../../../../utils/projectTimeUtils";
import { useSalaryCalculation } from "../../utils/useSalaryCalculation";
import { calculateSalary } from "../../utils/salaryCalculations";

// Import subcomponents
import EmployeeSelector from "./components/EmployeeSelector";
import SalaryConfigPanel from "./components/SalaryConfigPanel";
import CommissionPanel from "./components/CommissionPanel";
import BonusPanel from "./components/BonusPanel";
import SalaryResults from "./components/SalaryResultslaryResults";

const SalaryCalculator = ({ rows }) => {
  // Get employee data from context
  const { employees } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  // Get salary calculation parameters
  const salaryParams = useSalaryCalculation();

  // Set the first employee as default when employees data loads
  useEffect(() => {
    if (employees?.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  // Create a map of employee data with 24-hour conversion
  const employeeMap = {};
  if (employees?.length) {
    employees.forEach((emp) => {
      employeeMap[emp.id] = {
        ...emp,
        startHour24: to24Hour(emp.startHour, emp.startAmPm),
        endHour24: to24Hour(emp.endHour, emp.endAmPm),
      };
    });
  }

  // Get the selected employee
  const selectedEmployee = employeeMap[selectedEmployeeId];

  // Calculate salary based on all parameters
  const salaryData = calculateSalary({
    rows,
    selectedEmployee,
    baseSalary: salaryParams.baseSalary,
    commissionTiers: salaryParams.commissionTiers,
    usdToPkrRate: salaryParams.usdToPkrRate,
    calculationPeriodMonths: salaryParams.calculationPeriodMonths,
    perfectAttendance: salaryParams.perfectAttendance,
    attendanceBonus: salaryParams.attendanceBonus,
    qualityBonus: salaryParams.qualityBonus,
  });

  // If no employees, show alert
  if (!employees?.length) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Salary Calculator
        </Typography>
        <Alert severity="info">
          <Typography>
            No employees found. Please add employees in the Employees page
            first.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "#f8f9fa" }}>
      <Typography
        variant="h5"
        fontWeight="500"
        gutterBottom
        sx={{ mb: 3, color: "#1976d2" }}
      >
        Salary Calculator
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration section */}
        <Grid item xs={12} md={5}>
          <EmployeeSelector
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            setSelectedEmployeeId={setSelectedEmployeeId}
            formatShiftTime={(emp) => {
              if (!emp) return "";
              return `${emp.startHour}${emp.startAmPm.toLowerCase()}-${
                emp.endHour
              }${emp.endAmPm.toLowerCase()}`;
            }}
          />

          <SalaryConfigPanel
            baseSalary={salaryParams.baseSalary}
            setBaseSalary={salaryParams.setBaseSalary}
            usdToPkrRate={salaryParams.usdToPkrRate}
            setUsdToPkrRate={salaryParams.setUsdToPkrRate}
            calculationPeriodMonths={salaryParams.calculationPeriodMonths}
            setCalculationPeriodMonths={salaryParams.setCalculationPeriodMonths}
          />

          <CommissionPanel
            commissionTiers={salaryParams.commissionTiers}
            updateTierRate={salaryParams.updateTierRate}
          />

          <BonusPanel
            attendanceBonus={salaryParams.attendanceBonus}
            setAttendanceBonus={salaryParams.setAttendanceBonus}
            perfectAttendance={salaryParams.perfectAttendance}
            setPerfectAttendance={salaryParams.setPerfectAttendance}
            qualityBonus={salaryParams.qualityBonus}
            setQualityBonus={salaryParams.setQualityBonus}
            resetToDefaults={salaryParams.resetToDefaults}
            usdToPkrRate={salaryParams.usdToPkrRate}
          />
        </Grid>

        {/* Results section */}
        <Grid item xs={12} md={7}>
          <SalaryResults
            salaryData={salaryData}
            selectedEmployee={selectedEmployee}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SalaryCalculator;
