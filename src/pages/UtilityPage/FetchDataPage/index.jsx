import { useState, useCallback, useRef } from "react";
import { Typography, Box, Snackbar, Alert } from "@mui/material";
import { useUtilityData } from "../utils/useUtilityData";
import { DEFAULT_VALUES } from "../../../constants";
import { useUtility } from "../UtilityContext/hooks";
import DataFetchControls from "./components/DataFetchControls";
import DataActions from "./components/DataActions";
import FetchStatusDisplay from "./components/FetchStatusDisplay";
import ResultsArea from "./components/ResultsArea";

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

  // Fetch status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // Ref to prevent duplicated fetch operations
  const fetchInProgressRef = useRef(false);
  const fetchRequestCountRef = useRef(0);

  // Get utility data hooks
  const { fetchData, saveData } = useUtilityData();

  // Handle progress updates
  const handleProgressUpdate = useCallback((percent, message) => {
    console.log(`Setting progress: ${percent}%, message: ${message}`);
    setProgress(percent);
    setProgressText(message);
  }, []);

  // Handle fetch button click
  const handleFetchClick = useCallback(() => {
    // Check if fetch is already in progress
    if (fetchInProgressRef.current) {
      console.log("Fetch already in progress, not starting another one");
      return;
    }

    const currentFetchId = ++fetchRequestCountRef.current;
    console.log(`Starting fetch operation #${currentFetchId}`);

    // Set states for starting fetch
    setError(null);
    setProgress(0);
    setProgressText("Preparing to fetch data...");
    setLoading(true);
    fetchInProgressRef.current = true;
    setShouldFetch(true);

    // Start fetch operation
    const actualLimit = limitEnabled ? limit : null;

    fetchData(actualLimit, fromDate, toDate, handleProgressUpdate)
      .then(() => {
        if (currentFetchId === fetchRequestCountRef.current) {
          setSnackbar({
            open: true,
            message: "Data fetched successfully!",
            severity: "success",
          });
        }
      })
      .catch((err) => {
        if (currentFetchId === fetchRequestCountRef.current) {
          setError(err.message || "Error fetching data");
          setSnackbar({
            open: true,
            message: `Error: ${err.message}`,
            severity: "error",
          });
        }
      })
      .finally(() => {
        if (currentFetchId === fetchRequestCountRef.current) {
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      });
  }, [fetchData, fromDate, toDate, limit, limitEnabled, handleProgressUpdate]);

  // Handle save button click
  const handleSaveClick = useCallback(() => {
    saveData()
      .then(() => {
        setSnackbar({
          open: true,
          message: "Data saved successfully!",
          severity: "success",
        });
      })
      .catch((err) => {
        setSnackbar({
          open: true,
          message: `Error saving data: ${err.message}`,
          severity: "error",
        });
      });
  }, [saveData]);

  // Close snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fetch Thread Data
      </Typography>

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

      <Box sx={{ my: 2 }}>
        <DataActions
          onFetch={handleFetchClick}
          onSave={handleSaveClick}
          loading={loading}
          hasData={rows.length > 0}
        />

        <FetchStatusDisplay
          error={error}
          loading={loading}
          progress={progress}
          progressText={progressText}
        />
      </Box>

      <ResultsArea
        rows={rows}
        loading={loading}
        shouldFetch={shouldFetch}
        limitEnabled={limitEnabled}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FetchDataPage;
