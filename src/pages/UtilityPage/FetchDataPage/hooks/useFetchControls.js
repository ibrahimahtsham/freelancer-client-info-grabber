import { useState, useCallback } from "react";
import { DEFAULT_VALUES } from "../../../../constants";
import { format } from "date-fns";

export function useFetchControls(deps) {
  const {
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
    progressTracker, // Add this parameter
  } = deps;

  // Initialize date range with first day to last day of previous month

  // First day of previous month (at 00:00:00)
  const firstDayOfPreviousMonth = new Date();
  firstDayOfPreviousMonth.setDate(1); // Set to 1st of current month
  firstDayOfPreviousMonth.setMonth(firstDayOfPreviousMonth.getMonth() - 1); // Go back one month
  firstDayOfPreviousMonth.setHours(0, 0, 0, 0); // Start of day

  // Last day of previous month (at 23:59:59)
  const lastDayOfPreviousMonth = new Date();
  lastDayOfPreviousMonth.setDate(0); // This gives last day of previous month
  lastDayOfPreviousMonth.setHours(23, 59, 59, 999); // End of day

  // Use Date objects directly to handle both date and time
  const [fromDateTime, setFromDateTime] = useState(firstDayOfPreviousMonth);
  const [toDateTime, setToDateTime] = useState(lastDayOfPreviousMonth);

  // Other state
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [limit, setLimit] = useState(DEFAULT_VALUES.LIMIT);
  const [fetchType, setFetchType] = useState("complete");

  // Add rate limit settings
  const [rateLimitAggressiveness, setRateLimitAggressiveness] = useState(0.7); // Default to 70% aggressiveness

  // Format date in readable format for logs (DD/MM/YYYY h:mm a)
  const formatDateForDisplay = (date) => {
    return format(date, "dd/MM/yyyy h:mm a");
  };

  // Handle progress updates
  const handleProgressUpdate = useCallback(
    (percent, message) => {
      addLog(`Progress: ${percent}%, ${message}`, "progress");
      setProgress(percent);
      setProgressText(message);
    },
    [addLog, setProgress, setProgressText]
  );

  // Handle fetch button click
  const handleFetchClick = async () => {
    // Check if fetch is already in progress
    if (fetchInProgressRef.current) {
      addLog("Fetch already in progress, not starting another one", "warning");
      return;
    }

    // Clear previous logs, reset API stats, and start timer
    clearLogs();
    resetApiStats();
    startTimer();

    const currentFetchId = ++fetchRequestCountRef.current;
    addLog(`Starting fetch operation #${currentFetchId}`, "info");

    // Set states for starting fetch
    setError(null);
    setProgress(0);
    setProgressText("Preparing to fetch data...");
    setLoading(true);
    fetchInProgressRef.current = true;

    // Auto expand logs when fetch starts
    toggleLogs(true);

    // Start fetch operation
    const actualLimit = limitEnabled ? limit : null;

    // Use the formatted date/time for logs
    addLog(
      `Fetching data from ${formatDateForDisplay(
        fromDateTime
      )} to ${formatDateForDisplay(toDateTime)} with ${
        actualLimit ? actualLimit : "no"
      } limit and type: ${fetchType}`,
      "info"
    );

    // Format dates as ISO strings for the API
    const fromDateTimeString = fromDateTime.toISOString();
    const toDateTimeString = toDateTime.toISOString();

    try {
      // Reset progress tracker
      progressTracker?.resetProgress();

      const result = await fetchData(
        limitEnabled ? limit : null,
        fromDateTimeString,
        toDateTimeString,
        fetchType,
        (percent, message) => {
          setProgress(percent);
          setProgressText(message);
        },
        logger,
        progressTracker // Pass the progress tracker as the 7th parameter
      );

      if (currentFetchId === fetchRequestCountRef.current) {
        addLog(`Successfully fetched ${result.length} rows of data`, "success");
        setSnackbar({
          open: true,
          message: `Data fetched successfully! (${result.length} rows)`,
          severity: "success",
        });
      }
    } catch (err) {
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
    } finally {
      if (currentFetchId === fetchRequestCountRef.current) {
        // Stop timer
        stopTimer();
        addLog("Fetch operation completed", "success");

        setLoading(false);
        fetchInProgressRef.current = false;
      }
    }
  };

  return {
    fetchControls: {
      fromDateTime,
      setFromDateTime,
      toDateTime,
      setToDateTime,
      limitEnabled,
      setLimitEnabled,
      limit,
      setLimit,
      fetchType,
      setFetchType,
      // Add rate limit settings to the returned object
      rateLimit: {
        aggressiveness: rateLimitAggressiveness,
        setAggressiveness: setRateLimitAggressiveness,
      },
    },
    handleFetchClick,
    handleProgressUpdate,
  };
}
