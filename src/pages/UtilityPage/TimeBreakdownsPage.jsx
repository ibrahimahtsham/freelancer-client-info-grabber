import React, { useState, useMemo, useEffect } from "react";
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
} from "@mui/material";
import DataTable from "../../components/DataTable";
import { useUtility } from "./UtilityContext";

// Helper component for time selector
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
          <DataTable rows={awardedProjects} loading={loading} />
        </Paper>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
          Other Projects ({otherProjects.length})
        </Typography>
        <Paper elevation={2} sx={{ backgroundColor: "background.paper" }}>
          <DataTable rows={otherProjects} loading={loading} />
        </Paper>
      </CardContent>
    </Card>
  );
};

const TimeBreakdownsPage = () => {
  const { rows, loading } = useUtility();
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

  // Convert 12h to 24h format
  const to24Hour = (hour, ampm) => {
    if (ampm === "AM") {
      return hour === 12 ? 0 : hour;
    } else {
      return hour === 12 ? 12 : hour + 12;
    }
  };

  // Calculate filtered projects based on time ranges
  const filteredProjects = useMemo(() => {
    if (!rows.length)
      return {
        ibrahim: { awarded: [], other: [] },
        hafsa: { awarded: [], other: [] },
      };

    // Convert shift hours to 24h format
    const ibrahimStart = to24Hour(ibrahimStartHour, ibrahimStartAmPm);
    const ibrahimEnd = to24Hour(ibrahimEndHour, ibrahimEndAmPm);
    const hafsaStart = to24Hour(hafsaStartHour, hafsaStartAmPm);
    const hafsaEnd = to24Hour(hafsaEndHour, hafsaEndAmPm);

    // Track parsing success statistics
    let totalWithDate = 0;
    let successfullyParsed = 0;
    let exampleDate = "";

    // IMPROVED PARSING FUNCTION - handle multiple formats
    const parseDate = (dateString) => {
      if (!dateString || dateString === "N/A") return null;

      totalWithDate++;
      if (!exampleDate) exampleDate = dateString;

      try {
        // Check if date has any time component
        if (!dateString.includes(" ")) {
          return null; // No time information
        }

        // Try parsing as DD-MM-YYYY HH:MM:SS AM/PM format first
        const parts = dateString.split(" ");
        const datePart = parts[0];

        // Get the time part (handles cases where there might be multiple spaces)
        const timePart = parts.slice(1).join(" ");

        // Try several regex patterns for different time formats

        // Pattern 1: HH:MM:SS AM/PM
        let hourMatch = timePart.match(/(\d+):(\d+):(\d+)\s*([AP]M)/i);

        // Pattern 2: HH:MM AM/PM (no seconds)
        if (!hourMatch) {
          hourMatch = timePart.match(/(\d+):(\d+)\s*([AP]M)/i);
          if (hourMatch) {
            // Adjust for different group positions
            hourMatch[4] = hourMatch[3]; // Move AM/PM to expected position
          }
        }

        // Pattern 3: Last resort - just look for hour and AM/PM
        if (!hourMatch) {
          hourMatch = timePart.match(/(\d+)[^\d]*([AP]M)/i);
          if (hourMatch) {
            // Adjust for different group positions
            hourMatch[4] = hourMatch[2]; // Move AM/PM to expected position
          }
        }

        if (hourMatch) {
          const hour = parseInt(hourMatch[1], 10);
          const ampm =
            hourMatch[4]?.toUpperCase() ||
            hourMatch[3]?.toUpperCase() ||
            hourMatch[2]?.toUpperCase();

          // Convert to 24-hour format
          successfullyParsed++;
          return to24Hour(hour, ampm);
        }

        // Fallback: try direct Date parsing
        const dateObj = new Date(dateString);
        if (!isNaN(dateObj.getTime())) {
          successfullyParsed++;
          return dateObj.getHours();
        }

        return null;
      } catch (e) {
        console.warn("Failed to parse time:", dateString, e);
        return null;
      }
    };

    // Helper function to check if a project falls within a shift
    const isInShift = (dateString, startHour, endHour) => {
      const hour = parseDate(dateString);
      if (hour === null) return false;

      // Handle shifts that span across midnight
      if (startHour > endHour) {
        return hour >= startHour || hour < endHour;
      } else {
        return hour >= startHour && hour < endHour;
      }
    };

    // Filter for Ibrahim's shift
    const ibrahimProjects = rows.filter((row) =>
      isInShift(row.projectUploadDate, ibrahimStart, ibrahimEnd)
    );

    // Filter for Hafsa's shift
    const hafsaProjects = rows.filter((row) =>
      isInShift(row.projectUploadDate, hafsaStart, hafsaEnd)
    );

    // Save debug stats
    setTimeout(() => {
      setDebugInfo({
        total: totalWithDate,
        parsed: successfullyParsed,
        example: exampleDate,
      });
    }, 0);

    // Split each by award status
    return {
      ibrahim: {
        awarded: ibrahimProjects.filter((row) => row.awarded === "Yes"),
        other: ibrahimProjects.filter((row) => row.awarded !== "Yes"),
      },
      hafsa: {
        awarded: hafsaProjects.filter((row) => row.awarded === "Yes"),
        other: hafsaProjects.filter((row) => row.awarded !== "Yes"),
      },
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

      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Showing time breakdowns for {rows.length} projects
      </Typography>

      {/* Debug information */}
      {debugInfo.parsed === 0 && (
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
        loading={loading}
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
        loading={loading}
      />
    </Box>
  );
};

export default TimeBreakdownsPage;
