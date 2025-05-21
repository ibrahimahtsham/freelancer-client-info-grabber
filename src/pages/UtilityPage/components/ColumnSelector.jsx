// filepath: c:\Users\Siamax\Desktop\freelancer-client-info-grabber\src\pages\UtilityPage\components\ColumnSelector.jsx

import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

const ColumnSelector = ({ availableColumns, visibleColumns, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleColumn = (columnId) => {
    if (visibleColumns.includes(columnId)) {
      // Don't allow removing the last column
      if (visibleColumns.length <= 1) return;
      onChange(visibleColumns.filter((id) => id !== columnId));
    } else {
      onChange([...visibleColumns, columnId]);
    }
  };

  const handleSelectAll = () => {
    onChange(availableColumns.map((col) => col.id));
    handleClose();
  };

  const handleSelectNone = () => {
    // Ensure at least one column remains
    onChange(["bid_id"]);
    handleClose();
  };

  return (
    <>
      <Button
        startIcon={<ViewColumnIcon />}
        onClick={handleClick}
        variant="outlined"
        size="small"
      >
        Columns
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 250,
          },
        }}
      >
        <Box px={2} py={1}>
          <Typography variant="subtitle2">Toggle Columns</Typography>
        </Box>
        <Divider />
        <Box display="flex" px={2} py={1} justifyContent="space-between">
          <Button size="small" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button size="small" onClick={handleSelectNone}>
            Clear
          </Button>
        </Box>
        <Divider />
        {availableColumns.map((column) => (
          <MenuItem
            key={column.id}
            dense
            onClick={() => handleToggleColumn(column.id)}
          >
            <Checkbox
              checked={visibleColumns.includes(column.id)}
              size="small"
            />
            <ListItemText primary={column.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ColumnSelector;
