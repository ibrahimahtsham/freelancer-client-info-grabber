import { Box, Typography, Button } from "@mui/material";
import { getFormattedTimestamp } from "../utils";

const QuickAccessButtons = ({ datasets, onDatasetSelect }) => {
  if (!datasets || datasets.length === 0) return null;

  return (
    <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="subtitle2" align="center" color="text.secondary">
        Quick Access
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 1,
        }}
      >
        {datasets.slice(0, 5).map((dataset) => (
          <Button
            key={dataset.id}
            variant="outlined"
            size="small"
            onClick={() => onDatasetSelect(dataset.id)}
          >
            {getFormattedTimestamp(dataset.metadata.savedAt).slice(0, 10)}
            {" • "}
            {dataset.metadata.rowCount} records
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default QuickAccessButtons;
