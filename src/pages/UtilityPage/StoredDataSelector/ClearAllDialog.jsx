import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const ClearAllDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="clear-all-dialog-title"
      aria-describedby="clear-all-dialog-description"
    >
      <DialogTitle id="clear-all-dialog-title">Clear All Datasets</DialogTitle>
      <DialogContent>
        <DialogContentText id="clear-all-dialog-description">
          Are you sure you want to delete ALL saved datasets? This action cannot
          be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete All
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearAllDialog;
