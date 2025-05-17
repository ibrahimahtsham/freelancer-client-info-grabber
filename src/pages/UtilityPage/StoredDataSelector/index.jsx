import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useUtility } from "../UtilityContext";
import DeleteDialog from "./DeleteDialog";
import ClearAllDialog from "./ClearAllDialog";
import DatasetHeader from "./DatasetHeader";
import DatasetItem from "./DatasetItem";
import { getFormattedTimestamp } from "./utils";

const StoredDataSelector = () => {
  const {
    storedDatasets,
    selectedDatasetId,
    loadDataset,
    forceLoadDataset, // Add this
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

  // Effect to validate that selected dataset is properly loaded
  useEffect(() => {
    if (selectedDatasetId) {
      // Verify that rows have been properly loaded
      try {
        const datasetJson = localStorage.getItem(selectedDatasetId);
        if (!datasetJson) return;

        const dataset = JSON.parse(datasetJson);
        if (!dataset || !Array.isArray(dataset.rows)) return;

        // If rows count doesn't match what's in localStorage, force reload
        if (rows.length !== dataset.rows.length) {
          console.log("Rows count mismatch, force reloading dataset");
          setRows(dataset.rows); // Force direct update of rows
          setNotification({
            open: true,
            message: `Loaded ${dataset.rows.length} records from saved dataset`,
            severity: "success",
          });
        }
      } catch (err) {
        console.error("Error verifying dataset:", err);
      }
    }
  }, [selectedDatasetId, rows.length]);

  const handleChange = (event) => {
    const datasetId = event.target.value;
    if (datasetId) {
      // Set loading state in notification
      setNotification({
        open: true,
        message: "Loading dataset...",
        severity: "info",
      });

      // Try regular loading first
      const success = loadDataset(datasetId);

      // If that doesn't seem to work, use the force load method as backup
      if (!success) {
        console.log("Regular load failed, trying force load");
        const forceSuccess = forceLoadDataset(datasetId);

        if (forceSuccess) {
          // Force load worked, show success message after a short delay to ensure data loads
          setTimeout(() => {
            try {
              const datasetJson = localStorage.getItem(datasetId);
              const dataset = JSON.parse(datasetJson);
              if (dataset && Array.isArray(dataset.rows)) {
                setNotification({
                  open: true,
                  message: `Loaded ${dataset.rows.length} records from dataset`,
                  severity: "success",
                });
              }
            } catch (err) {
              console.error("Error showing load confirmation:", err);
            }
          }, 300);
        } else {
          // Both loading methods failed
          setNotification({
            open: true,
            message: "Failed to load dataset. Please try again.",
            severity: "error",
          });
        }
      } else {
        // Regular load succeeded
        setTimeout(() => {
          setNotification({
            open: true,
            message: `Dataset loaded successfully`,
            severity: "success",
          });
        }, 300);
      }
    } else {
      // If no dataset selected (empty selection), clear rows
      setRows([]);
    }
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
      {/* Delete and Clear All dialogs */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
      <ClearAllDialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
        onConfirm={handleConfirmClearAll}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Header with title and clear all button */}
      <DatasetHeader
        rowsCount={rows.length}
        hasStoredDatasets={storedDatasets.length > 0}
        onClearAll={handleClearAllClick}
      />

      {/* Dataset selector dropdown */}
      <FormControl fullWidth>
        <InputLabel id="stored-dataset-label">Select Dataset</InputLabel>
        <Select
          labelId="stored-dataset-label"
          id="stored-dataset-select"
          value={selectedDatasetId || ""}
          onChange={handleChange}
          label="Select Dataset"
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return <em>Select a dataset</em>;
            }

            const dataset = storedDatasets.find((d) => d.id === selected);
            if (!dataset) return selected;

            const timestamp = getFormattedTimestamp(dataset.metadata.savedAt);
            return `${timestamp} • ${dataset.metadata.fromDate} to ${dataset.metadata.toDate} (${dataset.metadata.rowCount} records)`;
          }}
        >
          <MenuItem value="">
            <em>Select a dataset</em>
          </MenuItem>

          {storedDatasets.map((dataset) => (
            <DatasetItem
              key={dataset.id}
              dataset={dataset}
              onDelete={handleDeleteClick}
            />
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
};

export default StoredDataSelector;
