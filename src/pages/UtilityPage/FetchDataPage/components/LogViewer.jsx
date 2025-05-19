import { Box, Typography } from "@mui/material";

const LogViewer = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ py: 2 }}
      >
        No logs to display
      </Typography>
    );
  }

  // Define colors for different log types
  const getLogStyle = (type) => {
    switch (type) {
      case "error":
        return { color: "#d32f2f", fontWeight: "bold" };
      case "warning":
        return { color: "#f57c00" };
      case "success":
        return { color: "#388e3c", fontWeight: "bold" };
      case "progress":
        return { color: "#1976d2" };
      case "api":
        return { color: "#7b1fa2", fontStyle: "italic" };
      default:
        return { color: "#616161" };
    }
  };

  return (
    <Box sx={{ fontFamily: "monospace", fontSize: "0.85rem", lineHeight: 1.5 }}>
      {logs.map((log, index) => (
        <Box key={index} sx={{ mb: 0.5, display: "flex" }}>
          <Typography
            component="span"
            sx={{ color: "#9e9e9e", mr: 1, minWidth: "70px" }}
          >
            [{log.timestamp}]
          </Typography>
          <Typography component="span" sx={getLogStyle(log.type)}>
            {log.message}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default LogViewer;
