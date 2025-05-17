import React from "react";
import { MenuItem, Typography, Box, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getFormattedTimestamp } from "./utils";

const DatasetItem = ({ dataset, onDelete }) => {
  const timestamp = getFormattedTimestamp(dataset.metadata.savedAt);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(e, dataset.id);
  };

  return (
    <MenuItem
      key={dataset.id}
      value={dataset.id}
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <Box>
        <Typography variant="body2">
          <strong>{timestamp}</strong> • {dataset.metadata.fromDate} to{" "}
          {dataset.metadata.toDate}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {dataset.metadata.rowCount} records • Limit: {dataset.metadata.limit}
        </Typography>
      </Box>
      <Tooltip title="Delete dataset">
        <IconButton size="small" onClick={handleDeleteClick} sx={{ ml: 2 }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </MenuItem>
  );
};

export default DatasetItem;
