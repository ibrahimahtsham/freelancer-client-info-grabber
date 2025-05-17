import React, { useState } from "react";
import { Paper } from "@mui/material";
import { useUtility } from "../../UtilityContext/hooks";
import DatasetHeader from "./DatasetHeader";
import NotificationSystem from "./NotificationSystem";
import DatasetSelector from "./DatasetSelector";
import QuickAccessButtons from "./QuickAccessButtons";
import DialogManager from "./DialogManager";

const StoredDataSelector = () => {
  const {
    storedDatasets,
    selectedDatasetId,
    loadDataset,
    deleteDataset,
    rows,
    setRows,
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

  // Handle dataset selection - either from dropdown or quick access
  const handleDatasetSelect = (datasetId) => {
    if (datasetId) {
      // Show loading notification
      setNotification({
        open: true,
        message: "Loading dataset...",
        severity: "info",
      });

      // Try loading the dataset
      const success = loadDataset(datasetId);

      // If regular load fails, try direct loading
      if (!success) {
        try {
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

          // Direct update of rows
          setRows([...dataset.rows]);

          setNotification({
            open: true,
            message: `Loaded ${dataset.rows.length} records`,
            severity: "success",
          });
        } catch (err) {
          setNotification({
            open: true,
            message: "Error loading dataset: " + err.message,
            severity: "error",
          });
        }
      } else {
        // Regular load succeeded - show notification after a small delay
        // to allow state updates to complete
        setTimeout(() => {
          setNotification({
            open: true,
            message: `Dataset loaded successfully with ${rows.length} records`,
            severity: "success",
          });
        }, 300);
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
