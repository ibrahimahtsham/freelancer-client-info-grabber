import { useState, useRef } from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import { useUtility } from "../UtilityContext/hooks";
import { useUtilityData } from "../utils/useUtilityData";

// Custom hooks
import { useTimer } from "./hooks/useTimer";
import { useLogger } from "./hooks/useLogger";
import { useApiStats } from "./hooks/useApiStats";
import { useSaveDataset } from "./hooks/useSaveDataset";
import { useFetchControls } from "./hooks/useFetchControls";

// Components
import ControlPanel from "./components/ControlPanel";
import FetchActions from "./components/FetchActions";
import LogsPanel from "./components/LogsPanel";
import ResultsSection from "./components/ResultsSection";
import DatasetNameDialog from "../components/DatasetNameDialog";

const FetchDataPage = () => {
  const { rows, refreshStoredDatasets } = useUtility();
  const { fetchData, saveData } = useUtilityData();

  // Refs to prevent duplicated fetch operations
  const fetchInProgressRef = useRef(false);
  const fetchRequestCountRef = useRef(0);

  // Fetch status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // Dataset name dialog state
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [datasetName, setDatasetName] = useState("");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Custom hooks
  const { timer, formatTime, startTimer, stopTimer } = useTimer();
  const { logs, showLogs, addLog, clearLogs, logsEndRef, toggleLogs, logger } =
    useLogger();
  const { apiCalls, showApiStats, resetApiStats, toggleApiStats } =
    useApiStats(loading);

  // Get fetch controls and destructure them
  const { fetchControls, handleFetchClick } = useFetchControls({
    fetchData,
    addLog,
    clearLogs,
    resetApiStats,
    startTimer,
    stopTimer,
    setLoading,
    setError,
    setProgress,
    setProgressText,
    fetchInProgressRef,
    fetchRequestCountRef,
    setSnackbar,
    toggleLogs,
    logger,
  });

  // Destructuring fetchControls to access the individual properties
  const { fromDateTime, toDateTime, limitEnabled, limit, fetchType } =
    fetchControls;

  // Now use the destructured variables
  const { handleSaveClick, handleSaveWithName } = useSaveDataset({
    rows,
    saveData,
    fetchControls: {
      fromDate: fromDateTime,
      toDate: toDateTime,
      limitEnabled,
      limit,
      fetchType,
    },
    refreshStoredDatasets,
    setNameDialogOpen,
    setDatasetName,
    setSnackbar,
    datasetName,
  });

  // Close snackbar
  const handleSnackbarClose = (reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fetch Freelancer Data
      </Typography>

      <ControlPanel controls={fetchControls} />

      <FetchActions
        onFetch={handleFetchClick}
        onSave={handleSaveClick}
        loading={loading}
        hasData={rows.length > 0}
        timer={timer}
        formatTime={formatTime}
        showApiStats={showApiStats}
        toggleApiStats={toggleApiStats}
        showLogs={showLogs}
        toggleLogs={toggleLogs}
        error={error}
        progress={progress}
        progressText={progressText}
      />

      <LogsPanel
        showApiStats={showApiStats}
        apiCalls={apiCalls}
        resetApiStats={resetApiStats}
        showLogs={showLogs}
        logs={logs}
        clearLogs={clearLogs}
        logsEndRef={logsEndRef}
      />

      <ResultsSection rows={rows} loading={loading} />

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

      <DatasetNameDialog
        open={nameDialogOpen}
        onClose={() => setNameDialogOpen(false)}
        name={datasetName}
        setName={setDatasetName}
        onSave={handleSaveWithName}
      />
    </Box>
  );
};

export default FetchDataPage;
