import { useState } from "react";
import {
  Box,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  Paper,
  Grid,
} from "@mui/material";
import { useUtility } from "../UtilityContext/hooks";
import { useEmployees } from "../../../contexts/EmployeeHooks";
import { useTimeProcessing } from "./utils/useTimeProcessing";
import DataTable from "../components/DataTable";
import StatsCard from "./components/StatsCard";

/**
 * Time Breakdowns Page Component
 * Shows project data broken down by employee shifts using DataTable
 */
const TimeBreakdownsPage = () => {
  const { rows } = useUtility();
  const { employees } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState(0);

  // No fallbacks - rely entirely on cookie data
  const employeeList = employees;

  // Get the current employee details - but check if valid index first
  const validIndex =
    employeeList.length > 0
      ? selectedEmployee < employeeList.length
        ? selectedEmployee
        : 0
      : 0;

  // Always call hooks at the top level, unconditionally
  const { filteredProjects, processingState, debugInfo } = useTimeProcessing({
    rows,
    employees: employeeList,
    selectedEmployeeIndex: validIndex,
  });

  const handleTabChange = (event, newValue) => {
    setSelectedEmployee(newValue);
  };

  // When no employees are available
  if (employeeList.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Time Breakdowns
        </Typography>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography>
            No employees found. Please add employees in the Employees page
            first.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const currentEmployee = employeeList[validIndex];

  // When no data is available
  if (rows.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Time Breakdowns
        </Typography>
        <Typography>
          Please fetch data first using the Fetch Data tab.
        </Typography>
      </Box>
    );
  }

  // Get current employee data
  const awardedProjects = filteredProjects[validIndex]?.awarded || [];
  const otherProjects = filteredProjects[validIndex]?.other || [];

  // Calculate stats for the current employee
  const totalBidAmount = awardedProjects.reduce(
    (sum, project) => sum + (parseFloat(project.bid_amount) || 0),
    0
  );

  const totalPaidAmount = awardedProjects.reduce(
    (sum, project) => sum + (parseFloat(project.paid_amount) || 0),
    0
  );

  const winRate =
    rows.length > 0
      ? (
          (awardedProjects.length /
            (awardedProjects.length + otherProjects.length)) *
          100
        ).toFixed(1)
      : 0;

  // Format the shift time for display
  const formatShiftTime = () => {
    const start = `${
      currentEmployee.startHour
    }${currentEmployee.startAmPm.toLowerCase()}`;
    const end = `${
      currentEmployee.endHour
    }${currentEmployee.endAmPm.toLowerCase()}`;
    return `${start} to ${end}`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Time Breakdowns by Employee Shift
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1">
          Showing time breakdowns for {rows.length} projects
        </Typography>

        {processingState.isProcessing && (
          <Chip
            color="primary"
            label={`Processing: ${processingState.progress}%`}
          />
        )}
      </Box>

      {/* Processing progress bar */}
      {processingState.isProcessing && (
        <Box sx={{ width: "100%", mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={processingState.progress}
          />
          <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
            {processingState.stage}
          </Typography>
        </Box>
      )}

      {/* Debug information */}
      {!processingState.isProcessing && debugInfo.parsed === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Parsing issue detected:</strong> Could not parse time from{" "}
            {debugInfo.total} date entries.
            <br />
            Example date format: "{debugInfo.example}"
            <br />
            Check that your date includes time information in format:
            "DD-MM-YYYY HH:MM:SS AM/PM"
          </Typography>
        </Alert>
      )}

      {/* Employee tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={validIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {employeeList.map((emp) => (
            <Tab
              key={emp.id}
              label={emp.name}
              sx={{
                borderBottom: `3px solid ${emp.color}`,
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Employee stats */}
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={2}
          sx={{ p: 2, backgroundColor: `${currentEmployee.color}15` }}
        >
          <Typography variant="h5" gutterBottom>
            {currentEmployee.name}'s Shift: {formatShiftTime()}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Projects Won"
                value={awardedProjects.length}
                total={awardedProjects.length + otherProjects.length}
                suffix="projects"
                color={currentEmployee.color}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Win Rate"
                value={winRate}
                suffix="%"
                color={currentEmployee.color}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Bid Amount"
                value={totalBidAmount.toFixed(2)}
                prefix="$"
                color={currentEmployee.color}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Paid Amount"
                value={totalPaidAmount.toFixed(2)}
                prefix="$"
                color={currentEmployee.color}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Awarded Projects Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
          Projects Won During {currentEmployee.name}'s Shift
        </Typography>
        <DataTable
          data={awardedProjects}
          title={`Awarded Projects (${awardedProjects.length})`}
          loading={processingState.isProcessing}
        />
      </Box>

      {/* Non-awarded Projects Table */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: "text.secondary" }}>
          Other Bids During {currentEmployee.name}'s Shift
        </Typography>
        <DataTable
          data={otherProjects}
          title={`Non-awarded Projects (${otherProjects.length})`}
          loading={processingState.isProcessing}
        />
      </Box>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Alert severity="info">
          <Typography variant="body2">
            To modify employee shift times, please use the{" "}
            <strong>Employees</strong> page in the navigation bar.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default TimeBreakdownsPage;
