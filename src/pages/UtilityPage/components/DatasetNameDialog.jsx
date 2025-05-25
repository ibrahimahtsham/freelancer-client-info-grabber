import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const DatasetNameDialog = ({ open, onClose, name, setName, onSave }) => {
  // Use local state to prevent input lag
  const [localName, setLocalName] = useState("");

  // Sync with parent state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalName(name || "");
    }
  }, [open, name]);

  const handleSave = () => {
    // Get the trimmed name
    const trimmedName = localName.trim();

    // Update parent state
    setName(trimmedName);

    // CHANGE: Call onSave with the name directly to avoid async timing issues
    onSave(trimmedName);

    // No need for setTimeout anymore
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Dataset</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Dataset Name"
          type="text"
          fullWidth
          variant="outlined"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="Enter a name for this dataset"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save Dataset
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatasetNameDialog;
