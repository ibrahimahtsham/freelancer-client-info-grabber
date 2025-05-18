import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Slider,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
} from "@mui/material";
import { useEmployees } from "../../../../contexts/EmployeeHooks";
import {
  parseProjectDateTime,
  isInShift,
  to24Hour,
} from "../../../../utils/projectTimeUtils";

const SalaryCalculator = ({ rows }) => {
  // Use employee data from context (cookies)
  const { employees } = useEmployees();

  // State for salary calculation parameters
  const [baseRate, setBaseRate] = useState(5); // Base hourly rate in USD
  const [commissionRate, setCommissionRate] = useState(20); // Commission percentage
  const [hoursPerProject, setHoursPerProject] = useState(10); // Average hours per project
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  // Set the first employee as default when employees data loads
  useEffect(() => {
    if (employees && employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  // Format shift time for display
  const formatShiftTime = (emp) => {
    if (!emp) return "";
    return `${emp.startHour}${emp.startAmPm.toLowerCase()}-${
      emp.endHour
    }${emp.endAmPm.toLowerCase()}`;
  };

  // Create a map of employee data for easy access
  const employeeMap = {};
  employees.forEach((emp) => {
    employeeMap[emp.id] = {
      ...emp,
      startHour24: to24Hour(emp.startHour, emp.startAmPm),
      endHour24: to24Hour(emp.endHour, emp.endAmPm),
    };
  });

  // Helper function to calculate salary
  const calculateSalary = () => {
    if (
      !rows ||
      !rows.length ||
      !selectedEmployeeId ||
      !employeeMap[selectedEmployeeId]
    )
      return null;

    const selectedEmployee = employeeMap[selectedEmployeeId];

    // Filter projects by person's shift using shared utility
    const personProjects = rows.filter((row) => {
      const hour = parseProjectDateTime(row.projectUploadDate);
      return isInShift(
        hour,
        selectedEmployee.startHour24,
        selectedEmployee.endHour24
      );
    });

    // Get awarded projects
    const awardedProjects = personProjects.filter(
      (row) => row.awarded === "Yes"
    );

    // Calculate total paid amount
    const totalPaid = personProjects.reduce((sum, row) => {
      const amount = parseFloat(row.totalPaidMilestones?.replace("$", "") || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Basic calculations
    const totalHours = awardedProjects.length * hoursPerProject;
    const baseEarnings = totalHours * baseRate;
    const commission = totalPaid * (commissionRate / 100);
    const totalEarnings = baseEarnings + commission;

    // Estimated monthly/weekly figures
    const monthlyEarnings = totalEarnings / 3; // Assuming 3 months of data
    const weeklyEarnings = monthlyEarnings / 4.33; // Average weeks per month

    return {
      totalProjects: personProjects.length,
      awardedProjects: awardedProjects.length,
      totalPaidAmount: totalPaid,
      totalHours,
      baseEarnings,
      commission,
      totalEarnings,
      monthlyEarnings,
      weeklyEarnings,
    };
  };

  const salaryData = calculateSalary();

  // If no employees, show alert
  if (employees.length === 0) {
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

  // Get the currently selected employee
  const selectedEmployee =
    employees.find((emp) => emp.id === selectedEmployeeId) || employees[0];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Salary Calculator
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration section */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Calculation Parameters
              </Typography>

              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">Select Team Member</FormLabel>
                <RadioGroup
                  row
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                >
                  {employees.map((emp) => (
                    <FormControlLabel
                      key={emp.id}
                      value={emp.id}
                      control={<Radio />}
                      label={`${emp.name} (${formatShiftTime(emp)})`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <Box sx={{ mb: 3 }}>
                <Typography id="base-rate-slider" gutterBottom>
                  Base Hourly Rate: ${baseRate}/hour
                </Typography>
                <Slider
                  value={baseRate}
                  onChange={(e, newValue) => setBaseRate(newValue)}
                  aria-labelledby="base-rate-slider"
                  valueLabelDisplay="auto"
                  min={1}
                  max={20}
                  marks={[
                    { value: 1, label: "$1" },
                    { value: 10, label: "$10" },
                    { value: 20, label: "$20" },
                  ]}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography id="commission-slider" gutterBottom>
                  Commission Rate: {commissionRate}% of project payments
                </Typography>
                <Slider
                  value={commissionRate}
                  onChange={(e, newValue) => setCommissionRate(newValue)}
                  aria-labelledby="commission-slider"
                  valueLabelDisplay="auto"
                  min={0}
                  max={50}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 25, label: "25%" },
                    { value: 50, label: "50%" },
                  ]}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography id="hours-slider" gutterBottom>
                  Average Hours Per Project: {hoursPerProject} hours
                </Typography>
                <Slider
                  value={hoursPerProject}
                  onChange={(e, newValue) => setHoursPerProject(newValue)}
                  aria-labelledby="hours-slider"
                  valueLabelDisplay="auto"
                  min={1}
                  max={40}
                  marks={[
                    { value: 1, label: "1" },
                    { value: 20, label: "20" },
                    { value: 40, label: "40" },
                  ]}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setBaseRate(5);
                    setCommissionRate(20);
                    setHoursPerProject(10);
                  }}
                >
                  Reset to Defaults
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results section */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Salary Calculation for {selectedEmployee?.name || "Employee"}
              </Typography>

              {salaryData ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Input Data
                  </Typography>
                  <Typography>
                    Total Projects: {salaryData.totalProjects}
                  </Typography>
                  <Typography>
                    Awarded Projects: {salaryData.awardedProjects}
                  </Typography>
                  <Typography>
                    Total Client Payments: $
                    {salaryData.totalPaidAmount.toFixed(2)}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1">Calculation Steps</Typography>
                  <Typography>
                    1. Base Hours: {salaryData.awardedProjects} projects ×{" "}
                    {hoursPerProject} hours = {salaryData.totalHours} hours
                  </Typography>
                  <Typography>
                    2. Base Earnings: {salaryData.totalHours} hours × $
                    {baseRate}/hour = ${salaryData.baseEarnings.toFixed(2)}
                  </Typography>
                  <Typography>
                    3. Commission: ${salaryData.totalPaidAmount.toFixed(2)} ×{" "}
                    {commissionRate}% = ${salaryData.commission.toFixed(2)}
                  </Typography>
                  <Typography>
                    4. Total Earnings: ${salaryData.baseEarnings.toFixed(2)} + $
                    {salaryData.commission.toFixed(2)} = $
                    {salaryData.totalEarnings.toFixed(2)}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle1"
                    sx={{ color: "success.main" }}
                  >
                    Estimated Earnings
                  </Typography>
                  <Typography variant="h5" sx={{ color: "success.main" }}>
                    ${salaryData.totalEarnings.toFixed(2)}
                  </Typography>
                  <Typography>
                    Monthly Average: ${salaryData.monthlyEarnings.toFixed(2)}
                  </Typography>
                  <Typography>
                    Weekly Average: ${salaryData.weeklyEarnings.toFixed(2)}
                  </Typography>
                </Box>
              ) : (
                <Typography>
                  No data available for calculation. Please ensure there are
                  projects within the selected team member's shift.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalaryCalculator;
