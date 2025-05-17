import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";

const UtilityContext = createContext();

// Helper to generate a unique key for stored datasets
const generateDatasetKey = () => `dataset_${Date.now()}`;

export function UtilityProvider({ children }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rateLimits, setRateLimits] = useState({ limit: "", remaining: "" });
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [storedDatasets, setStoredDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);

  // Add a version counter that increments when data changes, forcing re-renders
  const [dataVersion, setDataVersion] = useState(0);

  // Use ref to avoid infinite loops but track last loaded dataset
  const lastLoadedRef = useRef(null);

  // Debug effect to monitor rows changes
  useEffect(() => {
    console.log(`Rows state updated: ${rows.length} items`);
    // Increment version to signal changes to all components
    setDataVersion((v) => v + 1);
  }, [rows]);

  // Load available datasets from localStorage on component mount
  useEffect(() => {
    loadAvailableDatasets();
  }, []);

  // Function to save current dataset to localStorage
  const saveCurrentDataset = (fromDate, toDate, limit) => {
    try {
      // Generate metadata for this dataset
      const datasetId = generateDatasetKey();
      const dataset = {
        id: datasetId,
        metadata: {
          fromDate,
          toDate,
          limit: limit || "No limit",
          rowCount: rows.length,
          savedAt: new Date().toLocaleString(),
        },
        rows: rows,
      };

      // Store in localStorage
      localStorage.setItem(datasetId, JSON.stringify(dataset));

      // Update list of available datasets
      loadAvailableDatasets();

      return datasetId;
    } catch (err) {
      console.error("Error saving dataset:", err);
      return null;
    }
  };

  // Function to load available datasets from localStorage
  const loadAvailableDatasets = () => {
    try {
      const datasets = [];

      // Find all dataset keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("dataset_")) {
          try {
            const dataset = JSON.parse(localStorage.getItem(key));
            datasets.push({
              id: dataset.id,
              metadata: dataset.metadata,
            });
          } catch (e) {
            console.warn(`Failed to parse dataset ${key}:`, e);
          }
        }
      }

      // Sort newest first
      datasets.sort((a, b) => b.id.localeCompare(a.id));
      setStoredDatasets(datasets);
    } catch (err) {
      console.error("Error loading datasets:", err);
    }
  };

  // Function to load a specific dataset with improved debugging and error handling
  const loadDataset = (datasetId) => {
    try {
      // If we're trying to load the same dataset, don't do anything
      if (lastLoadedRef.current === datasetId) {
        console.log("Dataset already loaded:", datasetId);
        return true;
      }

      console.log("Loading dataset:", datasetId);
      lastLoadedRef.current = datasetId;

      // Clear existing state first to force UI update
      setRows([]); // This clear will trigger a UI update
      setLoading(true);
      setError("");
      setProgress(0);
      setProgressText("Loading stored dataset...");

      const datasetJson = localStorage.getItem(datasetId);
      if (!datasetJson) {
        console.error("Dataset not found in localStorage:", datasetId);
        setLoading(false);
        return false;
      }

      const dataset = JSON.parse(datasetJson);
      if (!dataset || !Array.isArray(dataset.rows)) {
        console.error("Invalid dataset format:", dataset);
        setLoading(false);
        return false;
      }

      console.log(`Loading ${dataset.rows.length} rows from dataset`);

      // Set the selected ID first
      setSelectedDatasetId(datasetId);

      // Use a small timeout to ensure state updates are processed in sequence
      setTimeout(() => {
        // Create a new array reference to ensure React detects the change
        const newRows = [...dataset.rows];
        console.log(`Setting rows to ${newRows.length} items`);
        setRows(newRows);
        setLoading(false);
        console.log("Dataset loading complete");

        // Increment version to force updates across components
        setDataVersion((v) => v + 1);
      }, 50);

      return true;
    } catch (err) {
      console.error("Error loading dataset:", err);
      setLoading(false);
      return false;
    }
  };

  // Add a specialized function for direct dataset loading
  const forceLoadDataset = (datasetId) => {
    try {
      console.log("Force loading dataset:", datasetId);
      const datasetJson = localStorage.getItem(datasetId);
      if (!datasetJson) return false;

      const dataset = JSON.parse(datasetJson);
      if (!dataset || !Array.isArray(dataset.rows)) return false;

      // Clear existing rows first to trigger proper re-renders
      setRows([]);

      // Then set with new data to ensure state change is detected
      setTimeout(() => {
        setSelectedDatasetId(datasetId);
        setRows([...dataset.rows]);
        console.log(`Force loaded ${dataset.rows.length} rows`);
      }, 10);

      return true;
    } catch (err) {
      console.error("Error force loading dataset:", err);
      return false;
    }
  };

  // Function to delete a specific dataset
  const deleteDataset = (datasetId) => {
    try {
      localStorage.removeItem(datasetId);
      loadAvailableDatasets();

      // If we're deleting the currently selected dataset, clear selection
      if (selectedDatasetId === datasetId) {
        setSelectedDatasetId(null);
        // Also clear the rows to prevent showing deleted data
        setRows([]);
      }
    } catch (err) {
      console.error("Error deleting dataset:", err);
    }
  };

  // Shared data and functions
  const value = {
    rows,
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
    storedDatasets,
    selectedDatasetId,
    dataVersion, // Include version for components to subscribe to changes
    saveCurrentDataset,
    loadDataset,
    forceLoadDataset,
    deleteDataset,
    loadAvailableDatasets,
  };

  return (
    <UtilityContext.Provider value={value}>{children}</UtilityContext.Provider>
  );
}

export function useUtility() {
  const context = useContext(UtilityContext);
  if (context === undefined) {
    throw new Error("useUtility must be used within a UtilityProvider");
  }
  return context;
}
