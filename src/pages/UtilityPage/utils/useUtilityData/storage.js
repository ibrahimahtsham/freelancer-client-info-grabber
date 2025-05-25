/**
 * Save data to localStorage with metadata
 * @param {Array<Object>} rows - Data rows to save
 * @param {Object} filters - Filter criteria used to fetch data
 * @param {String} datasetName - Name for the dataset
 * @returns {Promise<{success: boolean, datasetId: string|null}>}
 */
export async function saveDataToLocalStorage(
  rows,
  filters = {},
  datasetName = null
) {
  try {
    if (!rows || rows.length === 0) {
      throw new Error("No data to save");
    }

    // Log the incoming dataset name for debugging
    console.log("STORAGE saving dataset with name:", datasetName);

    // Generate a unique ID for this dataset
    const datasetId = `dataset_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Create dataset object with metadata - PRESERVE THE EXACT NAME
    const dataset = {
      id: datasetId,
      // Use exactly the name provided
      name: datasetName,
      metadata: {
        // Store original date objects for data integrity
        _fromDate: filters.fromDate || null,
        _toDate: filters.toDate || null,

        // Use pre-formatted values if available, otherwise format here
        fromDate: filters.fromDateFormatted || "Not specified",
        toDate: filters.toDateFormatted || "Not specified",

        limit: filters.limit || "No limit",
        fetchType: filters.fetchType || "All",
        rowCount: rows.length,
        savedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
      rows: rows,
    };

    // Save to localStorage
    localStorage.setItem(datasetId, JSON.stringify(dataset));

    // Update the dataset list
    const datasetList = JSON.parse(localStorage.getItem("datasetList") || "[]");

    const datasetListItem = {
      id: datasetId,
      // Use the exact name here too
      name: dataset.name,
      metadata: {
        fromDate: dataset.metadata.fromDate,
        toDate: dataset.metadata.toDate,
        limit: dataset.metadata.limit,
        fetchType: dataset.metadata.fetchType,
        savedAt: dataset.metadata.savedAt,
        rowCount: rows.length,
      },
    };

    datasetList.push(datasetListItem);
    localStorage.setItem("datasetList", JSON.stringify(datasetList));

    return { success: true, datasetId };
  } catch (err) {
    console.error("Error saving data:", err);
    return { success: false, datasetId: null };
  }
}

/**
 * Import dataset from file
 * @param {Object} dataset - Dataset object with rows and metadata
 * @returns {Promise<{success: boolean, datasetId: string|null}>}
 */
export async function importDatasetFromJson(dataset) {
  try {
    if (!dataset || !dataset.rows || !Array.isArray(dataset.rows)) {
      throw new Error("Invalid dataset format");
    }

    // Generate a unique ID for this dataset if not present
    const datasetId =
      dataset.id ||
      `dataset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Ensure dataset has proper structure
    const processedDataset = {
      id: datasetId,
      name:
        dataset.name || `Imported Dataset ${new Date().toLocaleDateString()}`,
      metadata: {
        ...(dataset.metadata || {}),
        fromDate: dataset.metadata?.fromDate || "Not specified",
        toDate: dataset.metadata?.toDate || "Not specified",
        limit: dataset.metadata?.limit || "No limit",
        fetchType: dataset.metadata?.fetchType || "All",
        rowCount: dataset.rows.length,
        savedAt: dataset.metadata?.savedAt || new Date().toISOString(),
        importedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
      rows: dataset.rows,
    };

    // Save to localStorage
    localStorage.setItem(datasetId, JSON.stringify(processedDataset));

    // Update the dataset list
    const datasetList = JSON.parse(localStorage.getItem("datasetList") || "[]");

    datasetList.push({
      id: datasetId,
      name: processedDataset.name,
      metadata: {
        fromDate: processedDataset.metadata.fromDate,
        toDate: processedDataset.metadata.toDate,
        limit: processedDataset.metadata.limit,
        fetchType: processedDataset.metadata.fetchType,
        savedAt: processedDataset.metadata.savedAt,
        importedAt: processedDataset.metadata.importedAt,
        rowCount: processedDataset.rows.length,
      },
    });
    localStorage.setItem("datasetList", JSON.stringify(datasetList));

    return { success: true, datasetId };
  } catch (err) {
    console.error("Error importing dataset:", err);
    return { success: false, datasetId: null };
  }
}
