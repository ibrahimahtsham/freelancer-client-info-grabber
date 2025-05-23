import { useState, useCallback, useRef, useEffect } from "react";

export function useLogger() {
  // Logs state
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  // Ref for auto scrolling log container
  const logsEndRef = useRef(null);

  // Function to add logs with timestamp in epoch format
  const addLog = useCallback((message, type = "info") => {
    const timestamp = Date.now(); // Use epoch timestamp
    setLogs((prevLogs) => [...prevLogs, { message, timestamp, type }]);
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Custom logger function to replace console.log
  const logger = useCallback(
    (message, type = "info") => {
      addLog(message, type);
    },
    [addLog]
  );

  // Toggle logs visibility
  const toggleLogs = useCallback(() => {
    setShowLogs((prev) => !prev);
  }, []);

  // Auto scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current && showLogs) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, showLogs]);

  return {
    logs,
    showLogs,
    addLog,
    clearLogs,
    logger,
    logsEndRef,
    toggleLogs,
  };
}
