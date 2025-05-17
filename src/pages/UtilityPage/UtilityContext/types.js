/**
 * @typedef {Object} DatasetMetadata
 * @property {string} fromDate - Start date of the dataset (YYYY-MM-DD)
 * @property {string} toDate - End date of the dataset (YYYY-MM-DD)
 * @property {string} limit - Applied result limit or "No limit"
 * @property {number} rowCount - Number of rows in the dataset
 * @property {string} savedAt - Timestamp when the dataset was saved
 */

/**
 * @typedef {Object} Dataset
 * @property {string} id - Unique identifier for the dataset
 * @property {DatasetMetadata} metadata - Dataset metadata
 * @property {Array<Object>} rows - The actual data rows
 */

/**
 * @typedef {Object} StoredDataset
 * @property {string} id - Unique identifier for the dataset
 * @property {DatasetMetadata} metadata - Dataset metadata (without the rows)
 */

/**
 * @typedef {Object} RateLimits
 * @property {string} limit - Total API request limit
 * @property {string} remaining - Remaining API requests
 * @property {boolean} [isRateLimited] - Whether the API is currently rate limited
 */

/**
 * @typedef {Object} UtilityContextState
 * @property {Array<Object>} rows - The current data rows
 * @property {boolean} loading - Loading state
 * @property {RateLimits} rateLimits - API rate limit information
 * @property {string} error - Error message, if any
 * @property {number} progress - Progress percentage (0-100)
 * @property {string} progressText - Progress status text
 * @property {Array<StoredDataset>} storedDatasets - List of available stored datasets
 * @property {string|null} selectedDatasetId - ID of the currently selected dataset
 * @property {number} dataVersion - Counter that increments when data changes
 *
 * @property {function} setRows - Function to update rows
 * @property {function} setLoading - Function to update loading state
 * @property {function} setRateLimits - Function to update rate limits
 * @property {function} setError - Function to update error message
 * @property {function} setProgress - Function to update progress percentage
 * @property {function} setProgressText - Function to update progress text
 *
 * @property {function(string, string, string|null): string|null} saveCurrentDataset - Save current data
 * @property {function(string): boolean} loadDataset - Load dataset by ID
 * @property {function(string): boolean} forceLoadDataset - Force load dataset by ID
 * @property {function(string): void} deleteDataset - Delete dataset by ID
 * @property {function(): Array<StoredDataset>} loadAvailableDatasets - Load all available datasets
 */

/**
 * @callback OnLoadSuccessCallback
 * @param {Dataset} dataset - The loaded dataset
 * @returns {void}
 */

// Export types for JSDoc usage elsewhere
export {};
