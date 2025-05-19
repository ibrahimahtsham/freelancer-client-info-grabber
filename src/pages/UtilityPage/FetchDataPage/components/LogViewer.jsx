import { Box, Typography, useTheme } from "@mui/material";

const LogViewer = ({ logs }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

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

  // Define colors for different log types that work in both light and dark modes
  const getLogStyle = (type) => {
    switch (type) {
      case "error":
        return {
          color: isDarkMode ? "#f44336" : "#d32f2f",
          fontWeight: "bold",
        };
      case "warning":
        return { color: isDarkMode ? "#ffb74d" : "#f57c00" };
      case "success":
        return {
          color: isDarkMode ? "#4caf50" : "#388e3c",
          fontWeight: "bold",
        };
      case "progress":
        return { color: isDarkMode ? "#64b5f6" : "#1976d2" };
      case "api":
        return {
          color: isDarkMode ? "#ba68c8" : "#7b1fa2",
          fontStyle: "italic",
        };
      default:
        return { color: isDarkMode ? "#e0e0e0" : "#616161" };
    }
  };

  return (
    <Box sx={{ fontFamily: "monospace", fontSize: "0.85rem", lineHeight: 1.5 }}>
      {logs.map((log, index) => (
        <Box key={index} sx={{ mb: 0.5, display: "flex" }}>
          <Typography
            component="span"
            sx={{
              color: isDarkMode ? "#9e9e9e" : "#757575",
              mr: 1,
              minWidth: "70px",
            }}
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
