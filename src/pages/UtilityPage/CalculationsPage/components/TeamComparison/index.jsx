import { useMemo } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { useEmployees } from "../../../../../contexts/EmployeeHooks";
import { calculateTeamStats } from "./utils/teamStatsCalculator";
import TeamStatsComparison from "./components/TeamStatsComparison";
import TeamCalendarHeatmap from "./components/TeamCalendarHeatmap";

const TeamComparison = ({ rows }) => {
  // Get employee data from context (cookies)
  const { employees } = useEmployees();

  // Calculate team stats based on time periods
  const teamStats = useMemo(() => {
    return calculateTeamStats(rows, employees);
  }, [rows, employees]);

  // If no stats or not enough employees, show message
  if (!teamStats || !employees || employees.length < 2) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Team Comparison
        </Typography>
        <Alert severity="info">
          <Typography>
            Team comparison requires at least two employees with shift
            information. Please add employee information in the Employees page.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Team Performance Analysis
      </Typography>

      {/* Traditional team stats comparison */}
      <TeamStatsComparison teamStats={teamStats} employees={employees} />

      {/* Calendar heatmaps for team comparison */}
      <TeamCalendarHeatmap rows={rows} employees={employees} />
    </Box>
  );
};

export default TeamComparison;
