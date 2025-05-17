import React, { createContext, useState, useContext, useEffect } from "react";

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

  // Function to load a specific dataset
  const loadDataset = (datasetId) => {
    try {
      const datasetJson = localStorage.getItem(datasetId);
      if (datasetJson) {
        const dataset = JSON.parse(datasetJson);
        setRows(dataset.rows);
        setSelectedDatasetId(datasetId);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error loading dataset:", err);
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
    saveCurrentDataset,
    loadDataset,
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
