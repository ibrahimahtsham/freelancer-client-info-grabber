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
        {datasets.slice(0, 5).map((dataset) => {
          // Force use the actual dataset name, not the timestamp
          const displayName = dataset.name
            ? dataset.name
            : `Dataset ${getFormattedTimestamp(dataset.metadata.savedAt)}`;

          return (
            <Tooltip
              key={dataset.id}
              title={
                <div style={{ whiteSpace: "pre-line" }}>
                  {`Name: ${displayName}
Date Range: ${dataset.metadata.fromDate || "Not specified"} to ${
                    dataset.metadata.toDate || "Not specified"
                  }
Records: ${dataset.metadata.rowCount}
Limit: ${dataset.metadata.limit}
Saved: ${getFormattedTimestamp(dataset.metadata.savedAt)}`}
                </div>
              }
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => onDatasetSelect(dataset.id)}
              >
                {displayName.length > 15
                  ? displayName.substring(0, 15) + "..."
                  : displayName}
              </Button>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default QuickAccessButtons;
