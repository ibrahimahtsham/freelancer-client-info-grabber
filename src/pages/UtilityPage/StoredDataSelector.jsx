import React from "react";
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

  const handleChange = (event) => {
    const datasetId = event.target.value;
    if (datasetId) {
      loadDataset(datasetId);
    }
  };

  const handleDelete = (event, datasetId) => {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this saved dataset?")) {
      deleteDataset(datasetId);
    }
  };

  const handleClearAllDatasets = () => {
    if (
      confirm(
        "Are you sure you want to delete ALL saved datasets? This cannot be undone."
      )
    ) {
      // Delete each dataset in storedDatasets
      storedDatasets.forEach((dataset) => {
        deleteDataset(dataset.id);
      });
    }
  };

  // Extract time from savedAt timestamp for prefix display
  const getTimePrefix = (savedAt) => {
    if (!savedAt) return "";
    const date = new Date(savedAt);
    if (isNaN(date.getTime())) return "";

    // Format as HH:MM
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Updated to use size prop instead of xs */}
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
        {/* Updated to use size prop instead of xs */}
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
              onClick={handleClearAllDatasets}
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

            const timePrefix = getTimePrefix(dataset.metadata.savedAt);
            return `${timePrefix} • ${dataset.metadata.fromDate} to ${dataset.metadata.toDate} (${dataset.metadata.rowCount} records)`;
          }}
        >
          <MenuItem value="">
            <em>Select a dataset</em>
          </MenuItem>

          {storedDatasets.map((dataset) => {
            const timePrefix = getTimePrefix(dataset.metadata.savedAt);

            return (
              <MenuItem
                key={dataset.id}
                value={dataset.id}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Box>
                  <Typography variant="body2">
                    <strong>{timePrefix}</strong> • {dataset.metadata.fromDate}{" "}
                    to {dataset.metadata.toDate}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dataset.metadata.rowCount} records • Limit:{" "}
                    {dataset.metadata.limit} • Saved: {dataset.metadata.savedAt}
                  </Typography>
                </Box>
                <Tooltip title="Delete dataset">
                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(e, dataset.id)}
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
