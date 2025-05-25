import { Grid, Typography, Box, Button } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const DatasetHeader = ({
  rowsCount,
  hasStoredDatasets,
  onClearAll,
  onImport,
  onExport,
}) => {
  return (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Grid item xs>
        <Typography variant="h6" component="div">
          Stored Datasets
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {rowsCount > 0
            ? `Current dataset: ${rowsCount} record${
                rowsCount !== 1 ? "s" : ""
              }`
            : "No dataset selected"}
        </Typography>
      </Grid>
      <Grid item>
        <Box sx={{ display: "flex", gap: 1 }}>
          {hasStoredDatasets && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={onExport}
            >
              Export
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<FileUploadIcon />}
            onClick={onImport}
          >
            Import
          </Button>
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
        </Box>
      </Grid>
    </Grid>
  );
};

export default DatasetHeader;
