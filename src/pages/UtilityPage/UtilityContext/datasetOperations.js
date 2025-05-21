// Helper to generate a unique key for stored datasets
export const generateDatasetKey = () => `dataset_${Date.now()}`;

// Function to save current dataset to localStorage
export function saveCurrentDataset(rows, fromDate, toDate, limit) {
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

    return datasetId;
  } catch (err) {
    console.error("Error saving dataset:", err);
    return null;
  }
}

// Function to load available datasets from localStorage
export function loadAvailableDatasets() {
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
    return datasets;
  } catch (err) {
    console.error("Error loading datasets:", err);
    return [];
  }
}

// Function to load a specific dataset
export function loadDataset(datasetId, onLoadSuccess) {
  try {
    const datasetJson = localStorage.getItem(datasetId);
    if (!datasetJson) {
      console.error("Dataset not found in localStorage:", datasetId);
      return false;
    }

    const dataset = JSON.parse(datasetJson);
    if (!dataset || !Array.isArray(dataset.rows)) {
      console.error("Invalid dataset format:", dataset);
      return false;
    }

    if (onLoadSuccess) {
      onLoadSuccess(dataset);
    }

    return true;
  } catch (err) {
    console.error("Error loading dataset:", err);
    return false;
  }
}

// Specialized function for direct dataset loading
export function forceLoadDataset(datasetId, onLoadSuccess) {
  try {
    const datasetJson = localStorage.getItem(datasetId);
    if (!datasetJson) return false;

    const dataset = JSON.parse(datasetJson);
    if (!dataset || !Array.isArray(dataset.rows)) return false;

    if (onLoadSuccess) {
      onLoadSuccess(dataset);
    }

    return true;
  } catch (err) {
    console.error("Error force loading dataset:", err);
    return false;
  }
}

// Function to delete a specific dataset
export function deleteDataset(datasetId) {
  try {
    localStorage.removeItem(datasetId);
    return true;
  } catch (err) {
    console.error("Error deleting dataset:", err);
    return false;
  }
}

/**
 * Get list of all saved datasets
 * @returns {Array} - Array of dataset metadata objects
 */
export function getDatasetList() {
  try {
    return JSON.parse(localStorage.getItem("datasetList") || "[]");
  } catch (err) {
    console.error("Error loading dataset list:", err);
    return [];
  }
}

/**
 * Update a dataset's name
 * @param {string} datasetId - ID of the dataset to rename
 * @param {string} newName - New name for the dataset
 * @returns {boolean} - Success status
 */
export function renameDataset(datasetId, newName) {
  try {
    // Update in the list
    const datasetList = getDatasetList();
    const datasetIndex = datasetList.findIndex((ds) => ds.id === datasetId);
    if (datasetIndex >= 0) {
      datasetList[datasetIndex].name = newName;
      localStorage.setItem("datasetList", JSON.stringify(datasetList));
    }

    // Update in the actual dataset
    const dataset = JSON.parse(localStorage.getItem(datasetId));
    if (dataset) {
      dataset.name = newName;
      dataset.metadata.lastModified = new Date().toISOString();
      localStorage.setItem(datasetId, JSON.stringify(dataset));
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error renaming dataset:", err);
    return false;
  }
}
