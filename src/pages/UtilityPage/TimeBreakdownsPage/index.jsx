import { useState } from "react";
import {
  Box,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { useUtility } from "../UtilityContext/hooks";
import { useEmployees } from "../../../contexts/EmployeeContext";
import ShiftCard from "./components/ShiftCard";
import { useTimeProcessing } from "./utils/useTimeProcessing";

/**
 * Time Breakdowns Page Component
 * Shows project data broken down by shift times
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

      {/* Employee's shift card */}
      <ShiftCard
        title={currentEmployee.name}
        backgroundColor={`${currentEmployee.color}15`} // 15 opacity hex
        startHour={currentEmployee.startHour}
        startAmPm={currentEmployee.startAmPm}
        endHour={currentEmployee.endHour}
        endAmPm={currentEmployee.endAmPm}
        // Explicitly passing null functions to ensure no time editing is possible
        setStartHour={null}
        setStartAmPm={null}
        setEndHour={null}
        setEndAmPm={null}
        awardedProjects={filteredProjects[validIndex]?.awarded || []}
        otherProjects={filteredProjects[validIndex]?.other || []}
        loading={processingState.isProcessing}
        readOnly={true}
      />

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
