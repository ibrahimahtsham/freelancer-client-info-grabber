import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getFormattedTimestamp } from "./utils";

const DatasetSelector = ({
  storedDatasets,
  selectedDatasetId,
  onDatasetChange,
  onDeleteClick,
}) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="stored-dataset-label">Select Dataset</InputLabel>
      <Select
        labelId="stored-dataset-label"
        id="stored-dataset-select"
        value={selectedDatasetId || ""}
        onChange={onDatasetChange}
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
                  onDeleteClick(e, dataset.id);
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
  );
};

export default DatasetSelector;
