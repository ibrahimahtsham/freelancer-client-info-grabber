import React, { useState } from "react";
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
} from "@mui/material";

const SalaryCalculator = ({ rows }) => {
  // State for salary calculation parameters
  const [baseRate, setBaseRate] = useState(5); // Base hourly rate in USD
  const [commissionRate, setCommissionRate] = useState(20); // Commission percentage
  const [hoursPerProject, setHoursPerProject] = useState(10); // Average hours per project
  const [selectedPerson, setSelectedPerson] = useState("ibrahim");

  // Helper function to calculate salary
  const calculateSalary = () => {
    if (!rows || !rows.length) return null;

    // Parse dates & determine shift
    const parseDateTime = (dateString) => {
      if (!dateString || dateString === "N/A") return null;

      try {
        const parts = dateString.split(" ");
        if (parts.length < 2) return null;

        const timePart = parts[1];
        const ampmPart = parts[2];

        // Parse time
        const [hours] = timePart.split(":").map(Number);

        // Convert to 24-hour format
        let hour24 = hours;
        if (ampmPart === "PM" && hours < 12) hour24 += 12;
        else if (ampmPart === "AM" && hours === 12) hour24 = 0;

        return hour24;
      } catch {
        return null;
      }
    };

    // Check if in shift
    const isInIbrahimShift = (hour) => {
      return hour >= 22 || hour < 7; // 10PM - 7AM
    };

    const isInHafsaShift = (hour) => {
      return hour >= 12 && hour < 22; // 12PM - 10PM
    };

    // Filter projects by person
    const personProjects = rows.filter((row) => {
      const hour = parseDateTime(row.projectUploadDate);
      if (hour === null) return false;

      return selectedPerson === "ibrahim"
        ? isInIbrahimShift(hour)
        : isInHafsaShift(hour);
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
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                >
                  <FormControlLabel
                    value="ibrahim"
                    control={<Radio />}
                    label="Ibrahim (10PM-7AM)"
                  />
                  <FormControlLabel
                    value="hafsa"
                    control={<Radio />}
                    label="Hafsa (12PM-10PM)"
                  />
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
                Salary Calculation for{" "}
                {selectedPerson === "ibrahim" ? "Ibrahim" : "Hafsa"}
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
