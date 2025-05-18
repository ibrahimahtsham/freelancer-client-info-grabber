import { useState } from "react";
import { Typography, Box, Snackbar, Alert, Chip } from "@mui/material";
import { useUtilityData } from "../utils/useUtilityData";
import { DEFAULT_VALUES } from "../../../constants";
import { useUtility } from "../UtilityContext/hooks";
import DataFetchControls from "./DataFetchControls";
import DataActions from "./DataActions";
import FetchStatusDisplay from "./FetchStatusDisplay";
import ResultsArea from "./ResultsArea";

const FetchDataPage = () => {
  const { rows } = useUtility();

  // Snackbar notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Date formatting helper
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get first days of current and previous months
  const firstDayOfCurrentMonth = new Date();
  firstDayOfCurrentMonth.setDate(1);

  const firstDayOfPreviousMonth = new Date();
  firstDayOfPreviousMonth.setDate(1);
  firstDayOfPreviousMonth.setMonth(firstDayOfPreviousMonth.getMonth() - 1);

  // State for controls
  const [fromDate, setFromDate] = useState(formatDate(firstDayOfPreviousMonth));
  const [toDate, setToDate] = useState(formatDate(firstDayOfCurrentMonth));
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [limit, setLimit] = useState(DEFAULT_VALUES.LIMIT);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Get utility context for shared state
  const {
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
    saveCurrentDataset,
  } = useUtility();

  // Use custom hook for data fetching
  useUtilityData(
    fromDate,
    toDate,
    limitEnabled ? limit : null,
    shouldFetch,
    setShouldFetch,
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

  // Event handlers
  const handleFetchData = () => {
    setShouldFetch(true);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSaveData = () => {
    const savedId = saveCurrentDataset(
      fromDate,
      toDate,
      limitEnabled ? limit : null
    );

    if (savedId) {
      setSnackbar({
        open: true,
        message:
          "Dataset saved successfully! You can access it from the dropdown above.",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message:
          "Failed to save dataset. The data might be too large for browser storage.",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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

      {/* Data controls component */}
      <DataFetchControls
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        limitEnabled={limitEnabled}
        setLimitEnabled={setLimitEnabled}
        limit={limit}
        setLimit={setLimit}
      />

      {/* Actions component */}
      <DataActions
        onFetch={handleFetchData}
        onSave={handleSaveData}
        loading={loading}
        hasData={rows.length > 0}
      />

      {/* Status display component */}
      <FetchStatusDisplay
        error={error}
        loading={loading}
        progress={progress}
        progressText={progressText}
      />

      {/* Results area component */}
      <ResultsArea
        rows={rows}
        loading={loading}
        shouldFetch={shouldFetch}
        limitEnabled={limitEnabled}
      />
    </Box>
  );
};

export default FetchDataPage;
