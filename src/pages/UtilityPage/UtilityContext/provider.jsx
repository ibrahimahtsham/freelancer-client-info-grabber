import { useState, useEffect, useRef, useCallback } from "react"; // Added useCallback
import { UtilityContext } from "./context"; // Import from the new file
import {
  loadAvailableDatasets,
  saveCurrentDataset,
  loadDataset,
  forceLoadDataset,
  deleteDataset,
} from "./datasetOperations";

export function UtilityProvider({ children }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rateLimits, setRateLimits] = useState({ limit: "", remaining: "" });
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [storedDatasets, setStoredDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);

  // Use ref to track last loaded dataset
  const lastLoadedRef = useRef(null);

  // Debug effect to monitor rows changes
  useEffect(() => {
    // Increment version to signal changes to all components
    setDataVersion((v) => v + 1);
  }, [rows]);

  // Load available datasets on component mount
  useEffect(() => {
    const datasets = loadAvailableDatasets();
    setStoredDatasets(datasets);
  }, []);

  // Add refreshStoredDatasets function
  const refreshStoredDatasets = useCallback(() => {
    // This reloads the dataset list from localStorage
    const datasets = loadAvailableDatasets();
    setStoredDatasets(datasets);
  }, []);

  // Shared context state and handlers
  const value = {
    // State
    rows,
    loading,
    rateLimits,
    error,
    progress,
    progressText,
    storedDatasets,
    selectedDatasetId,
    dataVersion,

    // State setters
    setRows,
    setLoading,
    setRateLimits,
    setError,
    setProgress,
    setProgressText,

    // Added refreshStoredDatasets to the context
    refreshStoredDatasets,

    // Dataset operations
    saveCurrentDataset: (fromDate, toDate, limit, datasetName) => {
      const datasetId = saveCurrentDataset(
        rows,
        fromDate,
        toDate,
        limit,
        datasetName
      );
      if (datasetId) {
        refreshStoredDatasets(); // Use the new function here instead
      }
      return datasetId;
    },

    loadDataset: (datasetId) => {
      lastLoadedRef.current = datasetId;
      setLoading(true);
      setError("");
      setProgress(0);
      setProgressText("Loading stored dataset...");

      const result = loadDataset(datasetId, (dataset) => {
        setSelectedDatasetId(datasetId);

        setTimeout(() => {
          setRows([...dataset.rows]);
          setLoading(false);
          setDataVersion((v) => v + 1);
        }, 50);
      });

      if (!result) {
        setLoading(false);
      }

      return result;
    },

    forceLoadDataset: (datasetId) => {
      const result = forceLoadDataset(datasetId, (dataset) => {
        setRows([]);

        setTimeout(() => {
          setSelectedDatasetId(datasetId);
          setRows([...dataset.rows]);
          setDataVersion((v) => v + 1);
        }, 10);
      });

      return result;
    },

    deleteDataset: (datasetId) => {
      deleteDataset(datasetId);
      refreshStoredDatasets(); // Use the new function here

      if (selectedDatasetId === datasetId) {
        setSelectedDatasetId(null);
        setRows([]);
      }
    },

    loadAvailableDatasets: () => {
      refreshStoredDatasets(); // Use the new function here
    },
  };

  return (
    <UtilityContext.Provider value={value}>{children}</UtilityContext.Provider>
  );
}
