import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Paper,
  Alert,
  LinearProgress,
  CircularProgress,
  Chip,
} from "@mui/material";
import DataTable from "../../components/DataTable";
import { useUtility } from "./UtilityContext";
import { to24Hour } from "../../utils/dateUtils";

// Helper component for time selector (unchanged)
const TimeSelector = ({ label, hour, ampm, onHourChange, onAmPmChange }) => (
  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
    <Typography variant="body2" sx={{ minWidth: 80 }}>
      {label}:
    </Typography>
    <FormControl size="small" sx={{ minWidth: 60 }}>
      <Select value={hour} onChange={(e) => onHourChange(e.target.value)}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <MenuItem key={h} value={h}>
            {h}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl size="small" sx={{ minWidth: 70 }}>
      <Select value={ampm} onChange={(e) => onAmPmChange(e.target.value)}>
        <MenuItem value="AM">AM</MenuItem>
        <MenuItem value="PM">PM</MenuItem>
      </Select>
    </FormControl>
  </Box>
);

// Helper component for shift card
const ShiftCard = ({
  title,
  backgroundColor,
  startHour,
  startAmPm,
  endHour,
  endAmPm,
  setStartHour,
  setStartAmPm,
  setEndHour,
  setEndAmPm,
  awardedProjects,
  otherProjects,
  loading,
}) => {
  // Convert to display format
  const formatTime = (hour, ampm) => `${hour}${ampm.toLowerCase()}`;

  return (
    <Card
      sx={{
        mb: 4,
        backgroundColor,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          {title} Shift ({formatTime(startHour, startAmPm)} -{" "}
          {formatTime(endHour, endAmPm)})
        </Typography>

        <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
          <TimeSelector
            label="Start Time"
            hour={startHour}
            ampm={startAmPm}
            onHourChange={setStartHour}
            onAmPmChange={setStartAmPm}
          />
          <TimeSelector
            label="End Time"
            hour={endHour}
            ampm={endAmPm}
            onHourChange={setEndHour}
            onAmPmChange={setEndAmPm}
          />
        </Box>

        {loading ? (
          <Box sx={{ my: 4, textAlign: "center" }}>
            <CircularProgress size={30} />
            <Typography sx={{ mt: 1 }}>Processing data...</Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mt: 3, fontWeight: "bold" }}
            >
              Awarded/Accepted Projects ({awardedProjects.length})
            </Typography>
            <Paper
              elevation={2}
              sx={{ mb: 4, backgroundColor: "background.paper" }}
            >
              <DataTable rows={awardedProjects} loading={false} />
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Other Projects ({otherProjects.length})
            </Typography>
            <Paper elevation={2} sx={{ backgroundColor: "background.paper" }}>
              <DataTable rows={otherProjects} loading={false} />
            </Paper>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const TimeBreakdownsPage = () => {
  const { rows, loading: globalLoading } = useUtility();
  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    progress: 0,
    stage: "",
  });
  const [debugInfo, setDebugInfo] = useState({
    total: 0,
    parsed: 0,
    example: "",
  });

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

  // State for filtered projects
  const [filteredProjects, setFilteredProjects] = useState({
    ibrahim: { awarded: [], other: [] },
    hafsa: { awarded: [], other: [] },
  });

  // Process data in smaller chunks to avoid UI freezing
  useEffect(() => {
    if (!rows.length) return;

    // Helper to parse time from string like "21-04-2023 10:30:45 AM"
    const parseTime = (dateString) => {
      if (!dateString || dateString === "N/A") return null;

      try {
        const parts = dateString.split(" ");
        if (parts.length < 2) return null;

        const timePart = parts[1]; // Get time part
        const ampmPart = parts[2]; // Get AM/PM part

        // Extract hours from time part (HH:MM:SS)
        const hourStr = timePart.split(":")[0];
        const hour = parseInt(hourStr, 10);

        if (isNaN(hour)) return null;

        // Convert to 24-hour format
        return to24Hour(hour, ampmPart);
      } catch (e) {
        console.warn("Error parsing time:", dateString, e);
        return null;
      }
    };

    // Check if a time falls within a shift
    const isInShift = (hour, startHour, endHour) => {
      if (hour === null) return false;

      // Handle shifts that span across midnight
      if (startHour > endHour) {
        return hour >= startHour || hour < endHour;
      } else {
        return hour >= startHour && hour < endHour;
      }
    };

    // Start processing in non-blocking chunks
    let ibrahimProjects = [];
    let hafsaProjects = [];
    let totalProcessed = 0;
    let totalWithDate = 0;
    let successfullyParsed = 0;
    let exampleDate = "";

    // Calculate 24-hour shift times
    const ibrahimStart = to24Hour(ibrahimStartHour, ibrahimStartAmPm);
    const ibrahimEnd = to24Hour(ibrahimEndHour, ibrahimEndAmPm);
    const hafsaStart = to24Hour(hafsaStartHour, hafsaStartAmPm);
    const hafsaEnd = to24Hour(hafsaEndHour, hafsaEndAmPm);

    // Set initial processing state
    setProcessingState({
      isProcessing: true,
      progress: 0,
      stage: "Analyzing project dates",
    });

    // Process in chunks of 50 items to avoid UI freezes
    const chunkSize = 50;
    const totalChunks = Math.ceil(rows.length / chunkSize);
    let currentChunk = 0;

    const processNextChunk = () => {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, rows.length);

      // Process this chunk
      for (let i = start; i < end; i++) {
        const row = rows[i];

        if (row.projectUploadDate && row.projectUploadDate !== "N/A") {
          totalWithDate++;
          if (!exampleDate) exampleDate = row.projectUploadDate;

          // Parse the time
          const hour = parseTime(row.projectUploadDate);

          if (hour !== null) {
            successfullyParsed++;

            // Check if in Ibrahim's shift
            if (isInShift(hour, ibrahimStart, ibrahimEnd)) {
              ibrahimProjects.push(row);
            }

            // Check if in Hafsa's shift
            if (isInShift(hour, hafsaStart, hafsaEnd)) {
              hafsaProjects.push(row);
            }
          }
        }
      }

      currentChunk++;
      totalProcessed = end;

      // Update progress
      setProcessingState({
        isProcessing: currentChunk < totalChunks,
        progress: Math.round((currentChunk / totalChunks) * 100),
        stage: `Processing ${totalProcessed} of ${rows.length} projects`,
      });

      // If more chunks to process, schedule the next one
      if (currentChunk < totalChunks) {
        setTimeout(processNextChunk, 10); // Small delay to let UI update
      } else {
        // All done, update filtered projects
        const ibrahim = {
          awarded: ibrahimProjects.filter((row) => row.awarded === "Yes"),
          other: ibrahimProjects.filter((row) => row.awarded !== "Yes"),
        };

        const hafsa = {
          awarded: hafsaProjects.filter((row) => row.awarded === "Yes"),
          other: hafsaProjects.filter((row) => row.awarded !== "Yes"),
        };

        setFilteredProjects({ ibrahim, hafsa });
        setDebugInfo({
          total: totalWithDate,
          parsed: successfullyParsed,
          example: exampleDate,
        });

        // Mark processing as complete
        setProcessingState({
          isProcessing: false,
          progress: 100,
          stage: "Completed",
        });
      }
    };

    // Start processing the first chunk
    processNextChunk();

    // Cleanup function to handle component unmounting during processing
    return () => {
      // Nothing specific to clean up, but good practice
    };
  }, [
    rows,
    ibrahimStartHour,
    ibrahimStartAmPm,
    ibrahimEndHour,
    ibrahimEndAmPm,
    hafsaStartHour,
    hafsaStartAmPm,
    hafsaEndHour,
    hafsaEndAmPm,
  ]);

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
