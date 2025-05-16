import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  TextField,
  useTheme,
  LinearProgress,
} from "@mui/material";
import useActiveThreads from "../hooks/useActiveThreads";
import TimingControls from "../components/TimingControls";
import FilteredThreadsSection from "../components/FilteredThreadsSection";
import {
  isInDateRange,
  isInTimeRange,
  formatHour,
  to24Hour,
} from "../utils/dateUtils";

const UtilityPage = () => {
  const { threads, loading, error, getThreads, progress, progressText } =
    useActiveThreads();
  const theme = useTheme();

  // Date range state (default: 2025-04-01 to 2025-05-01)
  const [fromDate, setFromDate] = useState("2025-04-01");
  const [toDate, setToDate] = useState("2025-05-01");

  // State for 12h input
  const [hafsaStartHour, setHafsaStartHour] = useState(12);
  const [hafsaStartAmpm, setHafsaStartAmpm] = useState("PM");
  const [hafsaEndHour, setHafsaEndHour] = useState(10);
  const [hafsaEndAmpm, setHafsaEndAmpm] = useState("PM");

  const [ibrahimStartHour, setIbrahimStartHour] = useState(10);
  const [ibrahimStartAmpm, setIbrahimStartAmpm] = useState("PM");
  const [ibrahimEndHour, setIbrahimEndHour] = useState(7);
  const [ibrahimEndAmpm, setIbrahimEndAmpm] = useState("AM");

  // Convert to 24h for filtering
  const hafsaStart = to24Hour(hafsaStartHour, hafsaStartAmpm);
  const hafsaEnd = to24Hour(hafsaEndHour, hafsaEndAmpm);
  const ibrahimStart = to24Hour(ibrahimStartHour, ibrahimStartAmpm);
  const ibrahimEnd = to24Hour(ibrahimEndHour, ibrahimEndAmpm);

  const [filtersApplied, setFiltersApplied] = useState(false);

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  // Helper to normalize award status
  function isAwarded(t) {
    return t.myBid && ["awarded", "accepted"].includes(t.myBid.award_status);
  }

  // All awarded/not awarded (before filters)
  const allAwarded = threads.filter(isAwarded);
  const allNotAwarded = threads.filter((t) => !isAwarded(t));

  // Debug: log only the lengths before filtering
  React.useEffect(() => {
    if (threads.length) {
      console.log("All threads (raw):", threads.length);
      console.log("Awarded threads (before filtering):", allAwarded.length);
      console.log(
        "Not awarded threads (before filtering):",
        allNotAwarded.length
      );
    }
  }, [threads, allAwarded, allNotAwarded]);

  // Filtering only after Apply Timing Filters is pressed
  let hafsaAwarded = [];
  let hafsaNotAwarded = [];
  let ibrahimAwarded = [];
  let ibrahimNotAwarded = [];

  function filterThreadsByRange(threads, startHour, endHour) {
    return threads.filter((t) => {
      const inDate = isInDateRange(t.projectUploadDate, from, to);
      const inTime = isInTimeRange(t.projectUploadDate, startHour, endHour);
      if (!inDate || !inTime) {
        // Debug: log why this thread is excluded
        console.log(
          `Excluded thread ${t.id}: inDate=${inDate}, inTime=${inTime}, projectUploadDate=${t.projectUploadDate}`
        );
      }
      return inDate && inTime;
    });
  }

  if (filtersApplied) {
    hafsaAwarded = filterThreadsByRange(allAwarded, hafsaStart, hafsaEnd);
    hafsaNotAwarded = filterThreadsByRange(allNotAwarded, hafsaStart, hafsaEnd);
    ibrahimAwarded = filterThreadsByRange(allAwarded, ibrahimStart, ibrahimEnd);
    ibrahimNotAwarded = filterThreadsByRange(
      allNotAwarded,
      ibrahimStart,
      ibrahimEnd
    );

    // Debug: log only the lengths after filtering
    console.log("Hafsa Awarded (after filtering):", hafsaAwarded.length);
    console.log("Hafsa Not Awarded (after filtering):", hafsaNotAwarded.length);
    console.log("Ibrahim Awarded (after filtering):", ibrahimAwarded.length);
    console.log(
      "Ibrahim Not Awarded (after filtering):",
      ibrahimNotAwarded.length
    );
  }

  // Color backgrounds based on theme
  const hafsaBg = theme.palette.mode === "dark" ? "#ff69b440" : "#ffe4ef";
  const ibrahimBg = theme.palette.mode === "dark" ? "#4caf5040" : "#eaffea";

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Utility Page
      </Typography>
      <Typography sx={{ mb: 2 }}>Test utilities and API calls here.</Typography>
      <Button variant="contained" onClick={getThreads} disabled={loading}>
        Fetch Active Threads with Project & Owner Info
      </Button>
      {loading && <CircularProgress sx={{ ml: 2 }} size={24} />}
      {loading && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography sx={{ mt: 1 }}>{progressText}</Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {threads.length > 0 && !filtersApplied && (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 4 }}>
          <FilteredThreadsSection
            title="All Awarded Projects"
            threads={allAwarded}
            loading={loading}
          />
          <FilteredThreadsSection
            title="All Not Awarded Projects"
            threads={allNotAwarded}
            loading={loading}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <TextField
              label="From Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <TextField
              label="To Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Box>
          <Box sx={{ mt: 3, display: "flex", gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <TimingControls
                label="Hafsa Start"
                hour={hafsaStartHour}
                setHour={setHafsaStartHour}
                ampm={hafsaStartAmpm}
                setAmpm={setHafsaStartAmpm}
              />
              <TimingControls
                label="Hafsa End"
                hour={hafsaEndHour}
                setHour={setHafsaEndHour}
                ampm={hafsaEndAmpm}
                setAmpm={setHafsaEndAmpm}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TimingControls
                label="Ibrahim Start"
                hour={ibrahimStartHour}
                setHour={setIbrahimStartHour}
                ampm={ibrahimStartAmpm}
                setAmpm={setIbrahimStartAmpm}
              />
              <TimingControls
                label="Ibrahim End"
                hour={ibrahimEndHour}
                setHour={setIbrahimEndHour}
                ampm={ibrahimEndAmpm}
                setAmpm={setIbrahimEndAmpm}
              />
            </Box>
          </Box>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setFiltersApplied(true)}
          >
            Apply Timing Filters
          </Button>
        </Box>
      )}
      {threads.length > 0 && filtersApplied && (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 4 }}>
          <FilteredThreadsSection
            bg={hafsaBg}
            title={`Hafsa Timings (${formatHour(hafsaStart)} - ${formatHour(
              hafsaEnd
            )}) — Awarded Projects`}
            threads={hafsaAwarded}
            loading={loading}
          />
          <FilteredThreadsSection
            bg={hafsaBg}
            title={`Hafsa Timings (${formatHour(hafsaStart)} - ${formatHour(
              hafsaEnd
            )}) — Not Awarded Projects`}
            threads={hafsaNotAwarded}
            loading={loading}
          />
          <FilteredThreadsSection
            bg={ibrahimBg}
            title={`Ibrahim Timings (${formatHour(ibrahimStart)} - ${formatHour(
              ibrahimEnd
            )}) — Awarded Projects`}
            threads={ibrahimAwarded}
            loading={loading}
          />
          <FilteredThreadsSection
            bg={ibrahimBg}
            title={`Ibrahim Timings (${formatHour(ibrahimStart)} - ${formatHour(
              ibrahimEnd
            )}) — Not Awarded Projects`}
            threads={ibrahimNotAwarded}
            loading={loading}
          />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default UtilityPage;
