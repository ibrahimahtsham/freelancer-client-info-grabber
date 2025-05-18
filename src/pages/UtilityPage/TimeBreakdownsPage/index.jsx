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

  // Fallback to default employees if none in context
  const employeeList =
    employees.length > 0
      ? employees
      : [
          {
            id: "1",
            name: "Ibrahim",
            color: "#4caf50",
            startHour: 10,
            startAmPm: "PM",
            endHour: 7,
            endAmPm: "AM",
          },
          {
            id: "2",
            name: "Hafsa",
            color: "#e91e63",
            startHour: 12,
            startAmPm: "PM",
            endHour: 10,
            endAmPm: "PM",
          },
        ];

  // Get the current employee details
  const currentEmployee = employeeList[selectedEmployee];

  // Use the time processing hook with the selected employee's shift
  const { filteredProjects, processingState, debugInfo } = useTimeProcessing({
    rows,
    employees: employeeList,
    selectedEmployeeIndex: selectedEmployee,
  });

  const handleTabChange = (event, newValue) => {
    setSelectedEmployee(newValue);
  };

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
          value={selectedEmployee}
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
        setStartHour={() => {}} // These are now managed via the Employees page
        setStartAmPm={() => {}}
        setEndHour={() => {}}
        setEndAmPm={() => {}}
        awardedProjects={filteredProjects[selectedEmployee]?.awarded || []}
        otherProjects={filteredProjects[selectedEmployee]?.other || []}
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
