import { Box, Typography, Alert } from "@mui/material";
import DataTable from "../../components/DataTable";

/**
 * Component for displaying project tables (awarded and non-awarded)
 */
const ProjectTables = ({
  currentEmployee,
  awardedProjects,
  otherProjects,
  isProcessing,
}) => {
  return (
    <>
      {/* Awarded Projects Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
          Projects Won During {currentEmployee.name}'s Shift
        </Typography>
        <DataTable
          data={awardedProjects}
          title={`Awarded Projects (${awardedProjects.length})`}
          loading={isProcessing}
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
          loading={isProcessing}
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
    </>
  );
};

export default ProjectTables;
