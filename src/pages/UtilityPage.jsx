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
import DateRangeControls from "../components/DateRangeControls";
import useThreadFilters from "../hooks/useThreadFilters";
import { to24Hour, formatHour } from "../utils/dateUtils";

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

  const [maxThreads, setMaxThreads] = useState(10); // or any default

  const [filtersApplied, setFiltersApplied] = useState(false);

  // Convert to 24h for filtering
  const hafsa = {
    start: to24Hour(hafsaStartHour, hafsaStartAmpm),
    end: to24Hour(hafsaEndHour, hafsaEndAmpm),
  };
  const ibrahim = {
    start: to24Hour(ibrahimStartHour, ibrahimStartAmpm),
    end: to24Hour(ibrahimEndHour, ibrahimEndAmpm),
  };
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  const {
    allAwarded,
    allNotAwarded,
    hafsaAwarded,
    hafsaNotAwarded,
    ibrahimAwarded,
    ibrahimNotAwarded,
  } = useThreadFilters(threads, from, to, hafsa, ibrahim, filtersApplied);

  // Color backgrounds based on theme
  const hafsaBg = theme.palette.mode === "dark" ? "#ff69b440" : "#ffe4ef";
  const ibrahimBg = theme.palette.mode === "dark" ? "#4caf5040" : "#eaffea";

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Utility Page
      </Typography>
      <Typography sx={{ mb: 2 }}>Test utilities and API calls here.</Typography>
      <TextField
        label="Max Threads"
        type="number"
        value={maxThreads}
        onChange={(e) => setMaxThreads(Number(e.target.value))}
        inputProps={{ min: 1 }}
        sx={{ mb: 2, maxWidth: 200 }}
      />
      <Button
        variant="contained"
        onClick={() => getThreads(maxThreads)}
        disabled={loading}
      >
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

          <Typography
            variant="h5"
            sx={{ mt: 4, mb: 2 }}
            color={theme.palette.mode === "dark" ? "#fff" : "#000"}
          >
            Apply Filters
          </Typography>

          <DateRangeControls
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
          />
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
            title={`Hafsa Timings (${formatHour(hafsa.start)} - ${formatHour(
              hafsa.end
            )}) — Awarded Projects`}
            threads={hafsaAwarded}
            loading={loading}
          />
          <FilteredThreadsSection
            bg={hafsaBg}
            title={`Hafsa Timings (${formatHour(hafsa.start)} - ${formatHour(
              hafsa.end
            )}) — Not Awarded Projects`}
            threads={hafsaNotAwarded}
            loading={loading}
          />
          <FilteredThreadsSection
            bg={ibrahimBg}
            title={`Ibrahim Timings (${formatHour(
              ibrahim.start
            )} - ${formatHour(ibrahim.end)}) — Awarded Projects`}
            threads={ibrahimAwarded}
            loading={loading}
          />
          <FilteredThreadsSection
            bg={ibrahimBg}
            title={`Ibrahim Timings (${formatHour(
              ibrahim.start
            )} - ${formatHour(ibrahim.end)}) — Not Awarded Projects`}
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
