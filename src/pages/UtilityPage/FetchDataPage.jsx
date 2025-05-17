import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip,
  TextField,
  LinearProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import DataTable from "../../components/DataTable";
import DateRangeControls from "../../components/DateRangeControls";
import { useUtilityData } from "../../hooks/useUtilityData";
import { DEFAULT_VALUES } from "../../constants";
import { useUtility } from "./UtilityContext";

const FetchDataPage = () => {
  // Use realistic dates instead of future dates with time zone handling
  const formatDate = (date) => {
    // Format as YYYY-MM-DD with time zone consideration
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get first day of current month
  const firstDayOfCurrentMonth = new Date();
  firstDayOfCurrentMonth.setDate(1);

  // Get first day of previous month
  const firstDayOfPreviousMonth = new Date();
  firstDayOfPreviousMonth.setDate(1);
  firstDayOfPreviousMonth.setMonth(firstDayOfPreviousMonth.getMonth() - 1);

  const [fromDate, setFromDate] = useState(formatDate(firstDayOfPreviousMonth));
  const [toDate, setToDate] = useState(formatDate(firstDayOfCurrentMonth));
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [limit, setLimit] = useState(DEFAULT_VALUES.LIMIT);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Get shared state from context - THIS IS THE KEY CHANGE:
  // We need to use the rows from context for rendering
  const {
    rows, // ← Use this for rendering instead of utilityData.rows
    setRows,
    loading,
    setLoading,
    rateLimits,
    setRateLimits,
    error,
    setError,
    progress,
    setProgress,
    progressText,
    setProgressText,
  } = useUtility();

  // Custom hook to handle data fetching
  useUtilityData(
    fromDate,
    toDate,
    limitEnabled ? limit : null,
    shouldFetch,
    setShouldFetch,
    // Update functions to use context state
    {
      onStart: () => {
        setLoading(true);
        setError("");
        setProgress(0);
        setProgressText("Initializing...");
      },
      onSuccess: (data) => {
        setRows(data.threads);
        setRateLimits(data.rateLimits);
      },
      onProgress: (percent, text) => {
        setProgress(percent);
        setProgressText(text);
      },
      onError: (err) => {
        if (err.name === "ApiError") {
          setError(`API Error (${err.status}): ${err.message}`);
        } else {
          setError(err.message || "An unknown error occurred");
        }
      },
      onComplete: () => {
        setLoading(false);
        setProgress(0);
        setProgressText("");
      },
    }
  );

  const handleFetchData = () => {
    setShouldFetch(true);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Fetch Project Data
        </Typography>

        {rateLimits.remaining && (
          <Chip
            color={
              rateLimits.isRateLimited
                ? "error"
                : parseInt(rateLimits.remaining) < 10
                ? "warning"
                : "success"
            }
            label={
              rateLimits.isRateLimited
                ? "🚫 Rate Limited! Wait before more requests"
                : `API Rate Limit: ${rateLimits.remaining}/${rateLimits.limit}`
            }
          />
        )}
      </Box>

      <Typography gutterBottom>
        Select a date range and result limit to fetch client and project data.
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          my: 3,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <DateRangeControls
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={limitEnabled}
                onChange={(e) => setLimitEnabled(e.target.checked)}
                name="limitToggle"
                color="primary"
              />
            }
            label="Enable Result Limit"
          />

          <TextField
            label="Result Limit"
            type="number"
            value={limit}
            onChange={(e) =>
              setLimit(
                Math.max(1, Math.min(1000, parseInt(e.target.value) || 5))
              )
            }
            InputProps={{ inputProps: { min: 1, max: 1000 } }}
            disabled={!limitEnabled}
            sx={{ width: 150 }}
          />
        </Box>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleFetchData}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? "Fetching Data..." : "Fetch Data"}
      </Button>

      {error && (
        <Typography color="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading && (
        <Box sx={{ my: 3 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography sx={{ mt: 1 }}>{progressText}</Typography>
        </Box>
      )}

      <Box mt={4}>
        {loading && rows.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading data...</Typography>
          </Box>
        ) : rows.length > 0 ? (
          <DataTable rows={rows} loading={loading} />
        ) : shouldFetch ? (
          <Typography>No data found for the selected date range.</Typography>
        ) : (
          <Typography>
            Select a date range and click "Fetch Data" to begin.
            {!limitEnabled &&
              " (No limit applied - may fetch all available data)"}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default FetchDataPage;
