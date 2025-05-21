import { Box, Typography, Button, Tooltip } from "@mui/material";
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
          <Tooltip key={dataset.id} title={dataset.name || "Unnamed Dataset"}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onDatasetSelect(dataset.id)}
            >
              {dataset.name
                ? `${dataset.name.substring(0, 10)}${
                    dataset.name.length > 10 ? "..." : ""
                  }`
                : getFormattedTimestamp(dataset.metadata.savedAt).slice(0, 10)}
              {" • "}
              {dataset.metadata.rowCount} records
            </Button>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default QuickAccessButtons;
