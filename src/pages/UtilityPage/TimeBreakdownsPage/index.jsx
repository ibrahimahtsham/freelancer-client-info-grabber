import { useState } from "react";
import { Box, Typography, Chip, LinearProgress } from "@mui/material";
import { useUtility } from "../UtilityContext/hooks";
import { useEmployees } from "../../../contexts/EmployeeHooks";
import { useTimeProcessing } from "./utils/useTimeProcessing";
import {
  NoEmployeesState,
  NoDataState,
  ParsingErrorAlert,
} from "./components/ErrorStates";
import EmployeeTabs from "./components/EmployeeTabs";
import StatsDisplay from "./components/StatsDisplay";
import ProjectTables from "./components/ProjectTables";

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
    return <NoEmployeesState />;
  }

  const currentEmployee = employeeList[validIndex];

  // When no data is available
  if (rows.length === 0) {
    return <NoDataState />;
  }

  // Get current employee data
  const awardedProjects = filteredProjects[validIndex]?.awarded || [];
  const otherProjects = filteredProjects[validIndex]?.other || [];

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
        <ParsingErrorAlert debugInfo={debugInfo} />
      )}

      {/* Employee tabs */}
      <EmployeeTabs
        employeeList={employeeList}
        validIndex={validIndex}
        handleTabChange={handleTabChange}
      />

      {/* Employee stats */}
      <StatsDisplay
        currentEmployee={currentEmployee}
        awardedProjects={awardedProjects}
        otherProjects={otherProjects}
      />

      {/* Projects Tables */}
      <ProjectTables
        currentEmployee={currentEmployee}
        awardedProjects={awardedProjects}
        otherProjects={otherProjects}
        isProcessing={processingState.isProcessing}
      />
    </Box>
  );
};

export default TimeBreakdownsPage;
