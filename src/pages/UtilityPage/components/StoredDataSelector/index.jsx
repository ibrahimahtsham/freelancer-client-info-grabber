import { useState } from "react";
import { Paper } from "@mui/material";
import { useUtility } from "../../UtilityContext/hooks";
import DatasetHeader from "./components/DatasetHeader";
import NotificationSystem from "./components/NotificationSystem";
import DatasetSelector from "./components/DatasetSelector";
import QuickAccessButtons from "./components/QuickAccessButtons";
import DialogManager from "./components/DialogManager";
import DatasetImportDialog from "../DatasetImportDialog";
// Import the export function
import { exportDatasetAsJson } from "../DataTable/utils/exportUtils";
// Import the import function from storage
import { importDatasetFromJson } from "../../utils/useUtilityData/storage";

const StoredDataSelector = () => {
  const {
    storedDatasets,
    selectedDatasetId,
    loadDataset,
    deleteDataset,
    rows,
    setRows,
    refreshStoredDatasets,
  } = useUtility();

  // State for delete confirmation dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  // Add state for import dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Handle dataset selection - either from dropdown or quick access
  const handleDatasetSelect = (datasetId) => {
    if (datasetId) {
      // Show loading notification
      setNotification({
        open: true,
        message: "Loading dataset...",
        severity: "info",
      });

      try {
        // Get the dataset directly from localStorage to display accurate count
        const datasetJson = localStorage.getItem(datasetId);
        if (!datasetJson) {
          setNotification({
            open: true,
            message: "Dataset not found. It may have been deleted.",
            severity: "error",
          });
          return;
        }

        const dataset = JSON.parse(datasetJson);
        if (!dataset || !Array.isArray(dataset.rows)) {
          setNotification({
            open: true,
            message: "Dataset format is invalid.",
            severity: "error",
          });
          return;
        }

        // Try loading the dataset through the utility context
        const success = loadDataset(datasetId);

        // If loading succeeded, show notification with the correct row count from localStorage
        setNotification({
          open: true,
          message: `Dataset loaded successfully with ${dataset.rows.length} records`,
          severity: "success",
        });

        // If regular load fails, set rows directly
        if (!success) {
          setRows([...dataset.rows]);
        }
      } catch (err) {
        setNotification({
          open: true,
          message: "Error loading dataset: " + err.message,
          severity: "error",
        });
      }
    } else {
      // Clear rows when no dataset is selected
      setRows([]);
    }
  };

  // Handle change for the dropdown selector
  const handleChange = (event) => {
    handleDatasetSelect(event.target.value);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (event, datasetId) => {
    event.stopPropagation();
    setDatasetToDelete(datasetId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    if (datasetToDelete) {
      deleteDataset(datasetToDelete);
      setDatasetToDelete(null);
      setNotification({
        open: true,
        message: "Dataset deleted successfully",
        severity: "success",
      });
    }
    setDeleteDialogOpen(false);
  };

  // Cancel delete action
  const handleCancelDelete = () => {
    setDatasetToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Open clear all confirmation dialog
  const handleClearAllClick = () => {
    setClearAllDialogOpen(true);
  };

  // Confirm clear all action
  const handleConfirmClearAll = () => {
    storedDatasets.forEach((dataset) => {
      deleteDataset(dataset.id);
    });
    setClearAllDialogOpen(false);
    setNotification({
      open: true,
      message: "All datasets cleared successfully",
      severity: "success",
    });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle export current dataset
  const handleExportCurrentDataset = () => {
    if (!selectedDatasetId || rows.length === 0) {
      setNotification({
        open: true,
        message: "No dataset selected to export",
        severity: "warning",
      });
      return;
    }

    // Find the current dataset metadata
    const dataset = storedDatasets.find((ds) => ds.id === selectedDatasetId);
    if (!dataset) {
      setNotification({
        open: true,
        message: "Dataset metadata not found",
        severity: "error",
      });
      return;
    }

    // Export the dataset
    try {
      exportDatasetAsJson(
        rows,
        dataset.metadata,
        dataset.name || "Freelancer Dataset"
      );
      setNotification({
        open: true,
        message: "Dataset exported successfully",
        severity: "success",
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Error exporting dataset: ${err.message}`,
        severity: "error",
      });
    }
  };

  // Handle import dataset
  const handleImport = async (importedData) => {
    try {
      const { success, datasetId } = await importDatasetFromJson(importedData);

      if (success) {
        // Refresh the dataset list
        refreshStoredDatasets();

        setNotification({
          open: true,
          message: `Dataset "${
            importedData.name || datasetId
          }" imported successfully with ${importedData.rows.length} records`,
          severity: "success",
        });

        // Automatically select the imported dataset
        handleDatasetSelect(datasetId);
      } else {
        throw new Error("Failed to import dataset");
      }
    } catch (err) {
      setNotification({
        open: true,
        message: `Error importing dataset: ${err.message}`,
        severity: "error",
      });
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      {/* Dialog management */}
      <DialogManager
        deleteDialogOpen={deleteDialogOpen}
        clearAllDialogOpen={clearAllDialogOpen}
        onDeleteCancel={handleCancelDelete}
        onDeleteConfirm={handleConfirmDelete}
        onClearAllClose={() => setClearAllDialogOpen(false)}
        onClearAllConfirm={handleConfirmClearAll}
      />

      {/* Import Dialog */}
      <DatasetImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />

      {/* Notifications */}
      <NotificationSystem
        notification={notification}
        onClose={handleNotificationClose}
      />

      {/* Header with title and clear all button */}
      <DatasetHeader
        rowsCount={rows.length}
        hasStoredDatasets={storedDatasets.length > 0}
        onClearAll={handleClearAllClick}
        onImport={() => setImportDialogOpen(true)}
        onExport={handleExportCurrentDataset}
      />

      {/* Dataset selector dropdown */}
      <DatasetSelector
        storedDatasets={storedDatasets}
        selectedDatasetId={selectedDatasetId}
        onDatasetChange={handleChange}
        onDeleteClick={handleDeleteClick}
      />

      {/* Quick Access Buttons */}
      <QuickAccessButtons
        datasets={storedDatasets}
        onDatasetSelect={handleDatasetSelect}
      />
    </Paper>
  );
};

export default StoredDataSelector;
