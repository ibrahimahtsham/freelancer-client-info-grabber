import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import useActiveThreads from "../hooks/useActiveThreads";
import ThreadsDataGrid from "../components/ThreadsDataGrid";

// Helper: check if date string is in range
function isInDateRange(dateStr, from, to) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return (!from || date >= from) && (!to || date <= to);
}

// Helper: check if date string is in time range
function isInTimeRange(dateStr, startHour, endHour) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const hour = Number(
    date.toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      hour12: false,
    })
  );
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  } else {
    return hour >= startHour || hour < endHour;
  }
}

const UtilityPage = () => {
  const { threads, loading, error, getThreads } = useActiveThreads();
  const theme = useTheme();

  // Date range state (default: 2025-04-01 to 2025-05-01)
  const [fromDate, setFromDate] = useState("2025-04-01");
  const [toDate, setToDate] = useState("2025-05-01");

  // Dynamic timings for Ibrahim and Hafsa
  const [ibrahimStart, setIbrahimStart] = useState(22); // 10pm
  const [ibrahimEnd, setIbrahimEnd] = useState(7); // 7am
  const [hafsaStart, setHafsaStart] = useState(12); // 12pm
  const [hafsaEnd, setHafsaEnd] = useState(22); // 10pm

  const [filtersApplied, setFiltersApplied] = useState(false);

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  function filterThreadsByRange(threads, startHour, endHour) {
    return threads.filter(
      (t) =>
        isInDateRange(t.projectUploadDate, from, to) &&
        isInTimeRange(t.projectUploadDate, startHour, endHour)
    );
  }

  // Helper to normalize award status
  function isAwarded(t) {
    return t.myBid && ["awarded", "accepted"].includes(t.myBid.award_status);
  }

  // All awarded/not awarded (before filters)
  const allAwarded = threads.filter(isAwarded);
  const allNotAwarded = threads.filter((t) => !isAwarded(t));

  // After filters: Hafsa
  const hafsaAwarded = filterThreadsByRange(allAwarded, hafsaStart, hafsaEnd);
  const hafsaNotAwarded = filterThreadsByRange(
    allNotAwarded,
    hafsaStart,
    hafsaEnd
  );

  // After filters: Ibrahim
  const ibrahimAwarded = filterThreadsByRange(
    allAwarded,
    ibrahimStart,
    ibrahimEnd
  );
  const ibrahimNotAwarded = filterThreadsByRange(
    allNotAwarded,
    ibrahimStart,
    ibrahimEnd
  );

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
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {threads.length > 0 && !filtersApplied && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 350 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                All Awarded Projects
              </Typography>
              <Paper
                sx={{
                  width: "100%",
                  overflowX: "auto",
                  maxWidth: "100vw",
                  background: "#181818",
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  mb: 2,
                }}
              >
                <ThreadsDataGrid threads={allAwarded} loading={loading} />
              </Paper>
            </Box>
            <Box sx={{ flex: 1, minWidth: 350 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                All Not Awarded Projects
              </Typography>
              <Paper
                sx={{
                  width: "100%",
                  overflowX: "auto",
                  maxWidth: "100vw",
                  background: "#181818",
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  mb: 2,
                }}
              >
                <ThreadsDataGrid threads={allNotAwarded} loading={loading} />
              </Paper>
            </Box>
          </Box>
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
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
            <Box>
              <Typography variant="subtitle1">Hafsa Timings</Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Start Hour"
                  type="number"
                  inputProps={{ min: 0, max: 23 }}
                  value={hafsaStart}
                  onChange={(e) => setHafsaStart(Number(e.target.value))}
                />
                <TextField
                  label="End Hour"
                  type="number"
                  inputProps={{ min: 0, max: 23 }}
                  value={hafsaEnd}
                  onChange={(e) => setHafsaEnd(Number(e.target.value))}
                />
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1">Ibrahim Timings</Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Start Hour"
                  type="number"
                  inputProps={{ min: 0, max: 23 }}
                  value={ibrahimStart}
                  onChange={(e) => setIbrahimStart(Number(e.target.value))}
                />
                <TextField
                  label="End Hour"
                  type="number"
                  inputProps={{ min: 0, max: 23 }}
                  value={ibrahimEnd}
                  onChange={(e) => setIbrahimEnd(Number(e.target.value))}
                />
              </Box>
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
          <Paper sx={{ p: 2, borderRadius: 2, background: hafsaBg }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Hafsa Timings ({formatHour(hafsaStart)} - {formatHour(hafsaEnd)})
              — Awarded Projects
            </Typography>
            <ThreadsDataGrid threads={hafsaAwarded} loading={loading} />
          </Paper>
          <Paper sx={{ p: 2, borderRadius: 2, background: hafsaBg }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Hafsa Timings ({formatHour(hafsaStart)} - {formatHour(hafsaEnd)})
              — Not Awarded Projects
            </Typography>
            <ThreadsDataGrid threads={hafsaNotAwarded} loading={loading} />
          </Paper>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 2, background: ibrahimBg }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Ibrahim Timings ({formatHour(ibrahimStart)} -{" "}
                {formatHour(ibrahimEnd)}) — Awarded Projects
              </Typography>
              <ThreadsDataGrid threads={ibrahimAwarded} loading={loading} />
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, background: ibrahimBg }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Ibrahim Timings ({formatHour(ibrahimStart)} -{" "}
                {formatHour(ibrahimEnd)}) — Not Awarded Projects
              </Typography>
              <ThreadsDataGrid threads={ibrahimNotAwarded} loading={loading} />
            </Paper>
          </Box>
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

// Helper to format hour in 12hr PKT
function formatHour(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleString("en-PK", {
    hour: "numeric",
    hour12: true,
    timeZone: "Asia/Karachi",
  });
}

export default UtilityPage;
