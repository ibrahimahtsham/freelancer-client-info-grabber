/**
 * Save data to localStorage with metadata
 * @param {Array<Object>} rows - Data rows to save
 * @param {Object} filters - Filter criteria used to fetch data
 * @param {String} datasetName - Optional custom name for the dataset
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

    // Generate a unique ID for this dataset
    const datasetId = `dataset_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Create dataset object with metadata
    const dataset = {
      id: datasetId,
      name: datasetName || `Dataset ${new Date().toLocaleDateString()}`,
      metadata: {
        ...filters,
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

    datasetList.push({
      id: datasetId,
      name: dataset.name,
      metadata: {
        savedAt: dataset.metadata.savedAt,
        rowCount: rows.length,
      },
    });
    localStorage.setItem("datasetList", JSON.stringify(datasetList));

    return { success: true, datasetId };
  } catch (err) {
    console.error("Error saving data:", err);
    return { success: false, datasetId: null };
  }
}
