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
    forceLoadDataset,
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

  // Enhanced debugging for selection events
  const handleChange = (event) => {
    const datasetId = event.target.value;
    console.log(
      `DROPDOWN SELECTION DETECTED: Selected dataset ID: ${datasetId}`
    );
    console.log(`Current rows before load: ${rows.length}`);

    if (datasetId) {
      // Set loading state in notification
      setNotification({
        open: true,
        message: "Loading dataset...",
        severity: "info",
      });

      // Verify dataset exists in localStorage before trying to load it
      const datasetExists = localStorage.getItem(datasetId);
      console.log(`Dataset exists in localStorage: ${Boolean(datasetExists)}`);

      if (datasetExists) {
        try {
          const parsedDataset = JSON.parse(datasetExists);
          console.log(
            `Dataset parsed successfully. Row count: ${
              parsedDataset.rows?.length || 0
            }`
          );
        } catch (e) {
          console.error("Failed to parse dataset:", e);
        }
      }

      // Try regular loading first
      console.log(
        "Attempting to load dataset with regular loadDataset function..."
      );
      const success = loadDataset(datasetId);
      console.log(`Regular load success: ${success}`);

      // Enhanced direct loading as backup
      if (!success) {
        console.log(
          "Regular load failed, attempting direct load from localStorage"
        );

        try {
          const datasetJson = localStorage.getItem(datasetId);
          if (!datasetJson) {
            console.error("Dataset not found in localStorage");
            return;
          }

          const dataset = JSON.parse(datasetJson);
          if (!dataset || !Array.isArray(dataset.rows)) {
            console.error("Invalid dataset format:", dataset);
            return;
          }

          console.log(
            `Directly loading ${dataset.rows.length} rows from localStorage`
          );

          // Force direct update of rows
          setRows([...dataset.rows]);

          console.log("Direct update of rows completed");

          setNotification({
            open: true,
            message: `Loaded ${dataset.rows.length} records with direct method`,
            severity: "success",
          });
        } catch (err) {
          console.error("Error during direct load:", err);
          setNotification({
            open: true,
            message: "Error loading dataset: " + err.message,
            severity: "error",
          });
        }
      } else {
        // Regular load succeeded
        setTimeout(() => {
          // Verify rows were actually loaded
          console.log(`Rows after load: ${rows.length}`);

          setNotification({
            open: true,
            message: `Dataset loaded successfully with ${rows.length} records`,
            severity: "success",
          });
        }, 300);
      }
    } else {
      // If no dataset selected (empty selection), clear rows
      console.log("Clearing rows due to empty selection");
      setRows([]);
    }
  };

  // Log when rows change in this component
  useEffect(() => {
    console.log(`StoredDataSelector: rows updated to ${rows.length}`);
  }, [rows]);

  // Effect to validate that selected dataset is properly loaded
  useEffect(() => {
    if (selectedDatasetId) {
      console.log(`Selected dataset changed to: ${selectedDatasetId}`);
      // Rest of the effect remains unchanged...
    }
  }, [selectedDatasetId, rows.length]);

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

  // Add debug force load button
  const debugForceLoad = () => {
    if (selectedDatasetId) {
      console.log("Debug force load button clicked");
      try {
        const datasetJson = localStorage.getItem(selectedDatasetId);
        const dataset = JSON.parse(datasetJson);
        if (dataset && Array.isArray(dataset.rows)) {
          console.log(`Force loading ${dataset.rows.length} rows`);
          // Create new array reference to ensure React detects the change
          setRows([...dataset.rows]);
          setNotification({
            open: true,
            message: `Force loaded ${dataset.rows.length} records`,
            severity: "success",
          });
        }
      } catch (err) {
        console.error("Error force loading:", err);
      }
    } else {
      console.log("No dataset selected for debug force load");
      setNotification({
        open: true,
        message: "Please select a dataset first",
        severity: "warning",
      });
    }
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
          onChange={(e) => {
            console.log(
              "Select onChange event triggered with value:",
              e.target.value
            );
            handleChange(e);
          }}
          onClick={(e) => console.log("Select clicked")} // Debug click on select
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

          {/* Instead of using DatasetItem, let's use direct MenuItem components for testing */}
          {storedDatasets.map((dataset) => (
            <MenuItem
              key={dataset.id}
              value={dataset.id}
              sx={{ display: "flex", justifyContent: "space-between" }}
              onClick={(e) =>
                console.log(`Direct MenuItem clicked: ${dataset.id}`)
              } // Debug direct click
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
                    e.stopPropagation(); // Stop MenuItem click
                    console.log(`Delete button clicked for ${dataset.id}`); // Debug delete click
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

      {/* Debug Force Load Button */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={debugForceLoad}
        >
          Debug Force Load
        </Button>
      </Box>
    </Paper>
  );
};

export default StoredDataSelector;
