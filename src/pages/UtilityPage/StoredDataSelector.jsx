import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useUtility } from "./UtilityContext";

const StoredDataSelector = () => {
  const {
    storedDatasets,
    selectedDatasetId,
    loadDataset,
    deleteDataset,
    rows,
  } = useUtility();

  // State for delete confirmation dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);

  const handleChange = (event) => {
    const datasetId = event.target.value;
    if (datasetId) {
      loadDataset(datasetId);
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
  };

  // Format the full timestamp (date + time)
  const getFormattedTimestamp = (savedAt) => {
    if (!savedAt) return "";
    const date = new Date(savedAt);
    if (isNaN(date.getTime())) return "";

    // Format as DD/MM/YY HH:MM
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      {/* Single item delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this dataset? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear all confirmation dialog */}
      <Dialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
        aria-labelledby="clear-all-dialog-title"
        aria-describedby="clear-all-dialog-description"
      >
        <DialogTitle id="clear-all-dialog-title">
          Clear All Datasets
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-all-dialog-description">
            Are you sure you want to delete ALL saved datasets? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClearAll}
            color="error"
            variant="contained"
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 9 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Stored Datasets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a previously stored dataset or fetch new data below
            </Typography>
          </Box>
        </Grid>
        <Grid
          size={{ xs: 3 }}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          {rows.length > 0 && (
            <Chip
              label={`Current Data: ${rows.length} records`}
              color="primary"
              variant="outlined"
              sx={{ mr: 2 }}
            />
          )}
          {storedDatasets.length > 0 && (
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteSweepIcon />}
              onClick={handleClearAllClick}
            >
              Clear All
            </Button>
          )}
        </Grid>
      </Grid>

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

          {storedDatasets.map((dataset) => {
            const timestamp = getFormattedTimestamp(dataset.metadata.savedAt);

            return (
              <MenuItem
                key={dataset.id}
                value={dataset.id}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Box>
                  <Typography variant="body2">
                    <strong>{timestamp}</strong> • {dataset.metadata.fromDate}{" "}
                    to {dataset.metadata.toDate}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dataset.metadata.rowCount} records • Limit:{" "}
                    {dataset.metadata.limit}
                  </Typography>
                </Box>
                <Tooltip title="Delete dataset">
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteClick(e, dataset.id)}
                    sx={{ ml: 2 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Paper>
  );
};

export default StoredDataSelector;
