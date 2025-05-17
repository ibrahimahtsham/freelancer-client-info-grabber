import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUtility } from "../UtilityContext";
import DeleteDialog from "./DeleteDialog";
import ClearAllDialog from "./ClearAllDialog";
import DatasetHeader from "./DatasetHeader";
import { getFormattedTimestamp } from "./utils";

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

  // Handle dataset selection
  const handleChange = (event) => {
    const datasetId = event.target.value;

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

          {/* Direct MenuItem components */}
          {storedDatasets.map((dataset) => (
            <MenuItem
              key={dataset.id}
              value={dataset.id}
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Box>
                <Typography variant="body2">
                  <strong>
                    {getFormattedTimestamp(dataset.metadata.savedAt)}
                  </strong>{" "}
                  • {dataset.metadata.fromDate} to {dataset.metadata.toDate}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dataset.metadata.rowCount} records • Limit:{" "}
                  {dataset.metadata.limit}
                </Typography>
              </Box>
              <Tooltip title="Delete dataset">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent MenuItem click event
                    handleDeleteClick(e, dataset.id);
                  }}
                  sx={{ ml: 2 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Quick Access Section - Keeping this as a helpful enhancement */}
      <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="subtitle2" align="center" color="text.secondary">
          Quick Access
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {storedDatasets.slice(0, 5).map((dataset) => (
            <Button
              key={dataset.id}
              variant="outlined"
              size="small"
              onClick={() => {
                // Simulate dataset selection
                const event = { target: { value: dataset.id } };
                handleChange(event);
              }}
            >
              {getFormattedTimestamp(dataset.metadata.savedAt).slice(0, 10)}
              {" • "}
              {dataset.metadata.rowCount} records
            </Button>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default StoredDataSelector;
