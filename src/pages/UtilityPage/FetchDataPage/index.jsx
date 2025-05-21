import { useState, useCallback, useRef, useEffect } from "react";
import {
  Typography,
  Box,
  Snackbar,
  Alert,
  Button,
  Paper,
  Collapse,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import DatasetIcon from "@mui/icons-material/Dataset";
import { useUtilityData } from "../utils/useUtilityData";
import { DEFAULT_VALUES } from "../../../constants";
import { useUtility } from "../UtilityContext/hooks";
import DataFetchControls from "./components/DataFetchControls";
import DataActions from "./components/DataActions";
import FetchStatusDisplay from "./components/FetchStatusDisplay";
import ResultsArea from "./components/ResultsArea";
import LogViewer from "./components/LogViewer";
import APICallsMonitor from "./components/APICallsMonitor";
import { getApiCallsStats, resetApiCallsStats } from "./apis";
import { formatDate } from "../../../utils/dateUtils";
import DataTable from "../components/DataTable";

const FetchDataPage = () => {
  const { rows } = useUtility();

  // Snackbar notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Timer state
  const [timer, setTimer] = useState({
    isRunning: false,
    startTime: null,
    duration: null,
  });

  // Logs state
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  // API calls monitoring
  const [apiCalls, setApiCalls] = useState({ total: 0, endpoints: {} });
  const [showApiStats, setShowApiStats] = useState(false);

  // Ref for auto scrolling log container
  const logsEndRef = useRef(null);

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
  const [fetchType, setFetchType] = useState("complete");

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

  // Update API calls stats periodically while fetching
  useEffect(() => {
    let interval;

    if (loading) {
      // Update API stats every 2 seconds during fetch
      interval = setInterval(() => {
        try {
          const stats = getApiCallsStats();
          setApiCalls(stats);
        } catch (e) {
          console.error("Failed to update API stats:", e);
        }
      }, 2000);

      // Show API stats when loading starts
      setShowApiStats(true);
    } else if (interval) {
      clearInterval(interval);

      // Get final API stats when loading finishes
      try {
        const stats = getApiCallsStats();
        setApiCalls(stats);
      } catch (e) {
        console.error("Failed to get final API stats:", e);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  // Function to add logs with timestamp in epoch format
  const addLog = useCallback((message, type = "info") => {
    const timestamp = Date.now(); // Use epoch timestamp
    setLogs((prevLogs) => [...prevLogs, { message, timestamp, type }]);
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Reset API stats
  const resetApiStats = useCallback(() => {
    resetApiCallsStats();
    setApiCalls({ total: 0, endpoints: {} });
  }, []);

  // Auto scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current && showLogs) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, showLogs]);

  // Timer effect
  useEffect(() => {
    let interval;

    if (timer.isRunning && timer.startTime) {
      interval = setInterval(() => {
        const currentDuration = Math.floor(
          (Date.now() - timer.startTime) / 1000
        );
        setTimer((prev) => ({ ...prev, duration: currentDuration }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);

  // Format timer display
  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle progress updates
  const handleProgressUpdate = useCallback(
    (percent, message) => {
      addLog(`Progress: ${percent}%, ${message}`, "progress");
      setProgress(percent);
      setProgressText(message);
    },
    [addLog]
  );

  // Custom logger function to replace console.log
  const logger = useCallback(
    (message, type = "info") => {
      addLog(message, type);
    },
    [addLog]
  );

  // Handle fetch button click
  const handleFetchClick = useCallback(() => {
    // Check if fetch is already in progress
    if (fetchInProgressRef.current) {
      addLog("Fetch already in progress, not starting another one", "warning");
      return;
    }

    // Clear previous logs, reset API stats, and start timer
    clearLogs();
    resetApiStats();
    setTimer({ isRunning: true, startTime: Date.now(), duration: 0 });

    const currentFetchId = ++fetchRequestCountRef.current;
    addLog(`Starting fetch operation #${currentFetchId}`, "info");

    // Set states for starting fetch
    setError(null);
    setProgress(0);
    setProgressText("Preparing to fetch data...");
    setLoading(true);
    fetchInProgressRef.current = true;

    // Auto expand logs when fetch starts
    setShowLogs(true);

    // Start fetch operation
    const actualLimit = limitEnabled ? limit : null;

    addLog(
      `Fetching data from ${fromDate} to ${toDate} with ${
        actualLimit ? actualLimit : "no"
      } limit and type: ${fetchType}`,
      "info"
    );

    fetchData(
      actualLimit,
      fromDate,
      toDate,
      fetchType,
      handleProgressUpdate,
      logger
    )
      .then((data) => {
        if (currentFetchId === fetchRequestCountRef.current) {
          addLog(`Successfully fetched ${data.length} rows of data`, "success");
          setSnackbar({
            open: true,
            message: `Data fetched successfully! (${data.length} rows)`,
            severity: "success",
          });
        }
      })
      .catch((err) => {
        if (currentFetchId === fetchRequestCountRef.current) {
          const errorMessage = err.message || "Error fetching data";
          addLog(`Error: ${errorMessage}`, "error");
          setError(errorMessage);
          setSnackbar({
            open: true,
            message: `Error: ${errorMessage}`,
            severity: "error",
          });
        }
      })
      .finally(() => {
        if (currentFetchId === fetchRequestCountRef.current) {
          // Stop timer
          setTimer((prev) => ({ ...prev, isRunning: false }));
          addLog("Fetch operation completed", "success");

          // Get final API stats
          try {
            const stats = getApiCallsStats();
            setApiCalls(stats);
            addLog(`Total API calls: ${stats.total}`, "info");
          } catch (e) {
            console.error("Failed to get final API stats:", e);
          }

          setLoading(false);
          fetchInProgressRef.current = false;
        }
      });
  }, [
    fetchData,
    fromDate,
    toDate,
    limit,
    limitEnabled,
    fetchType,
    handleProgressUpdate,
    clearLogs,
    resetApiStats,
    addLog,
    logger,
  ]);

  // Handle save button click
  const handleSaveClick = useCallback(() => {
    saveData(rows)
      .then(({ success, datasetId }) => {
        if (success) {
          setSnackbar({
            open: true,
            message: `Data saved successfully as dataset: ${datasetId}`,
            severity: "success",
          });
        } else {
          throw new Error("Failed to save dataset");
        }
      })
      .catch((err) => {
        setSnackbar({
          open: true,
          message: `Error saving data: ${err.message}`,
          severity: "error",
        });
      });
  }, [saveData, rows]);

  // Close snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Toggle logs visibility
  const toggleLogs = () => {
    setShowLogs((prev) => !prev);
  };

  // Toggle API stats visibility
  const toggleApiStats = () => {
    setShowApiStats((prev) => !prev);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fetch Freelancer Data
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
        fetchType={fetchType}
        setFetchType={setFetchType}
      />

      <Box sx={{ my: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <DataActions
              onFetch={handleFetchClick}
              onSave={handleSaveClick}
              loading={loading}
              hasData={rows.length > 0}
            />

            {timer.isRunning && (
              <Chip
                label={`Time: ${formatTime(timer.duration)}`}
                color="primary"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}

            {!timer.isRunning && timer.duration !== null && (
              <Chip
                label={`Completed in: ${formatTime(timer.duration)}`}
                color="success"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Box>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              startIcon={<DatasetIcon />}
              endIcon={showApiStats ? <CloseIcon /> : <ExpandMoreIcon />}
              onClick={toggleApiStats}
              sx={{ mr: 1 }}
            >
              {showApiStats ? "Hide API Stats" : "API Stats"}
            </Button>

            <Button
              variant="outlined"
              size="small"
              color="info"
              startIcon={<InfoIcon />}
              endIcon={showLogs ? <CloseIcon /> : <ExpandMoreIcon />}
              onClick={toggleLogs}
            >
              {showLogs ? "Hide Logs" : "Show Logs"}
            </Button>
          </Box>
        </Box>

        <FetchStatusDisplay
          error={error}
          loading={loading}
          progress={progress}
          progressText={progressText}
        />
      </Box>

      {/* API Calls Monitor */}
      <Collapse in={showApiStats}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <APICallsMonitor stats={apiCalls} onReset={resetApiStats} />
        </Paper>
      </Collapse>

      {/* Log Viewer */}
      <Collapse in={showLogs}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            maxHeight: "300px",
            overflow: "auto",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle2">Operation Logs</Typography>
            <Button size="small" onClick={clearLogs}>
              Clear
            </Button>
          </Box>
          <LogViewer logs={logs} />
          <div ref={logsEndRef} />
        </Paper>
      </Collapse>

      {/* DataTable with conditional rendering */}
      {rows && rows.length > 0 ? (
        <DataTable data={rows} title="Bid Analysis" loading={loading} />
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          {loading ? (
            <Typography>Loading data...</Typography>
          ) : (
            <Typography>No data available. Please fetch data first.</Typography>
          )}
        </Paper>
      )}

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
