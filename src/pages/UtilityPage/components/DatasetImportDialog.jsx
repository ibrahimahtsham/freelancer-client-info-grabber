import React, { useState, useRef, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const Input = styled("input")({
  display: "none",
});

// Use memo to prevent unnecessary re-renders
const DatasetImportDialog = memo(function DatasetImportDialog({
  open,
  onClose,
  onImport,
}) {
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Use the file name (without extension) as default dataset name
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setName(fileName);
    }
  };

  const handleImportClick = () => {
    if (!selectedFile) {
      setError("Please select a file to import");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate the imported data
        if (!importedData.rows || !Array.isArray(importedData.rows)) {
          throw new Error("Invalid dataset format: missing rows array");
        }

        // Override the name if user provided one
        if (name && name.trim() !== "") {
          importedData.name = name;
        }

        // Make sure metadata exists
        if (!importedData.metadata) {
          importedData.metadata = {};
        }

        // Add import timestamp
        importedData.metadata.importedAt = new Date().toISOString();

        onImport(importedData);
        resetAndClose();
      } catch (err) {
        setError(`Error importing dataset: ${err.message}`);
      }
    };
    reader.readAsText(selectedFile);
  };

  const resetAndClose = () => {
    setSelectedFile(null);
    setName("");
    setError("");
    onClose();
  };

  // Avoid re-rendering when dialog is closed
  if (!open) return null;

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Dataset</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <label htmlFor="contained-button-file">
            <Input
              id="contained-button-file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
            />
            <Button variant="outlined" component="span" fullWidth>
              Select JSON File
            </Button>
          </label>

          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </Box>

        <TextField
          margin="dense"
          label="Dataset Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name for this dataset"
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleImportClick}
          color="primary"
          variant="contained"
          disabled={!selectedFile}
        >
          Import Dataset
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default DatasetImportDialog;
