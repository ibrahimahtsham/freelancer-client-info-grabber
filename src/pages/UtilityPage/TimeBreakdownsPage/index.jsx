import { useState } from "react";
import { Box, Typography, Alert, LinearProgress, Chip } from "@mui/material";
import { useUtility } from "../UtilityContext/hooks";
import ShiftCard from "./components/ShiftCard";
import { useTimeProcessing } from "./utils/useTimeProcessing";

/**
 * Time Breakdowns Page Component
 * Shows project data broken down by shift times
 */
const TimeBreakdownsPage = () => {
  const { rows } = useUtility();

  // Ibrahim shift (default: 10pm - 7am)
  const [ibrahimStartHour, setIbrahimStartHour] = useState(10);
  const [ibrahimStartAmPm, setIbrahimStartAmPm] = useState("PM");
  const [ibrahimEndHour, setIbrahimEndHour] = useState(7);
  const [ibrahimEndAmPm, setIbrahimEndAmPm] = useState("AM");

  // Hafsa shift (default: 12pm - 10pm)
  const [hafsaStartHour, setHafsaStartHour] = useState(12);
  const [hafsaStartAmPm, setHafsaStartAmPm] = useState("PM");
  const [hafsaEndHour, setHafsaEndHour] = useState(10);
  const [hafsaEndAmPm, setHafsaEndAmPm] = useState("PM");

  // Use the time processing hook to handle all data transformation
  const { filteredProjects, processingState, debugInfo } = useTimeProcessing({
    rows,
    ibrahimStartHour,
    ibrahimStartAmPm,
    ibrahimEndHour,
    ibrahimEndAmPm,
    hafsaStartHour,
    hafsaStartAmPm,
    hafsaEndHour,
    hafsaEndAmPm,
  });

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
        Time Breakdowns by Shift
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

      {/* Ibrahim's shift card - green background */}
      <ShiftCard
        title="Ibrahim's"
        backgroundColor="rgba(76, 175, 80, 0.15)"
        startHour={ibrahimStartHour}
        startAmPm={ibrahimStartAmPm}
        endHour={ibrahimEndHour}
        endAmPm={ibrahimEndAmPm}
        setStartHour={setIbrahimStartHour}
        setStartAmPm={setIbrahimStartAmPm}
        setEndHour={setIbrahimEndHour}
        setEndAmPm={setIbrahimEndAmPm}
        awardedProjects={filteredProjects.ibrahim.awarded}
        otherProjects={filteredProjects.ibrahim.other}
        loading={processingState.isProcessing}
      />

      {/* Hafsa's shift card - pink background */}
      <ShiftCard
        title="Hafsa's"
        backgroundColor="rgba(233, 30, 99, 0.15)"
        startHour={hafsaStartHour}
        startAmPm={hafsaStartAmPm}
        endHour={hafsaEndHour}
        endAmPm={hafsaEndAmPm}
        setStartHour={setHafsaStartHour}
        setStartAmPm={setHafsaStartAmPm}
        setEndHour={setHafsaEndHour}
        setEndAmPm={setHafsaEndAmPm}
        awardedProjects={filteredProjects.hafsa.awarded}
        otherProjects={filteredProjects.hafsa.other}
        loading={processingState.isProcessing}
      />
    </Box>
  );
};

export default TimeBreakdownsPage;
