import React from "react";
import { Box, Typography, Chip, Button, Grid } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

const DatasetHeader = ({ rowsCount, hasStoredDatasets, onClearAll }) => {
  return (
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
        {rowsCount > 0 && (
          <Chip
            label={`Current Data: ${rowsCount} records`}
            color="primary"
            variant="outlined"
            sx={{ mr: 2 }}
          />
        )}
        {hasStoredDatasets && (
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteSweepIcon />}
            onClick={onClearAll}
          >
            Clear All
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export default DatasetHeader;
