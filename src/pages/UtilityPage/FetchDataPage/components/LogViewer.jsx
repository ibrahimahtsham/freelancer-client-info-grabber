import { Box, Typography, Divider, useTheme } from "@mui/material";
import { formatEpochToPakistanTime } from "../../../../utils/dateUtils";

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
          color: isDarkMode ? "#ff6b6b" : "#d32f2f",
          backgroundColor: isDarkMode
            ? "rgba(255,107,107,0.1)"
            : "rgba(211,47,47,0.05)",
        };
      case "warning":
        return {
          color: isDarkMode ? "#ffa502" : "#ed6c02",
          backgroundColor: isDarkMode
            ? "rgba(255,165,2,0.1)"
            : "rgba(237,108,2,0.05)",
        };
      case "success":
        return {
          color: isDarkMode ? "#2ed573" : "#2e7d32",
          backgroundColor: isDarkMode
            ? "rgba(46,213,115,0.1)"
            : "rgba(46,125,50,0.05)",
        };
      case "api":
        return {
          color: isDarkMode ? "#70a1ff" : "#1976d2",
          backgroundColor: isDarkMode
            ? "rgba(112,161,255,0.1)"
            : "rgba(25,118,210,0.05)",
        };
      case "progress":
        return {
          color: isDarkMode ? "#a29bfe" : "#5c6bc0",
          backgroundColor: isDarkMode
            ? "rgba(162,155,254,0.1)"
            : "rgba(92,107,192,0.05)",
        };
      case "rate_limit":
        return {
          color: isDarkMode ? "#ff9ff3" : "#c2185b",
          backgroundColor: isDarkMode
            ? "rgba(255,159,243,0.1)"
            : "rgba(194,24,91,0.05)",
        };
      default:
        return {
          color: "text.primary",
          backgroundColor: isDarkMode
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.03)",
        };
    }
  };

  // Helper to format epoch timestamps in logs
  const formatTimestamp = (text) => {
    // Find epoch timestamps (10-13 digits) and replace with formatted dates
    return text.replace(/\b(\d{10,13})\b/g, (match) => {
      const timestamp = parseInt(match, 10);
      // If 10 digits, it's seconds, otherwise milliseconds
      const date =
        match.length === 10 ? new Date(timestamp * 1000) : new Date(timestamp);

      return `${match} (${date.toLocaleString()})`;
    });
  };

  // Group logs by timestamp for better visualization
  const groupedLogs = [];
  let currentTimestamp = null;
  let currentGroup = [];

  logs.forEach((log) => {
    // Format the timestamp for display
    const displayTimestamp = formatEpochToPakistanTime(
      log.timestamp / 1000 // Convert from ms to seconds for the formatter
    );

    if (log.timestamp !== currentTimestamp) {
      // Start a new group
      if (currentGroup.length > 0) {
        groupedLogs.push({
          timestamp: displayTimestamp,
          logs: currentGroup,
        });
      }
      currentTimestamp = log.timestamp;
      currentGroup = [log];
    } else {
      // Add to existing group
      currentGroup.push(log);
    }
  });

  // Add the last group
  if (currentGroup.length > 0) {
    groupedLogs.push({
      timestamp: formatEpochToPakistanTime(currentTimestamp / 1000),
      logs: currentGroup,
    });
  }

  return (
    <Box sx={{ fontFamily: "monospace", fontSize: "0.85rem", lineHeight: 1.5 }}>
      {groupedLogs.map((group, groupIndex) => (
        <Box key={groupIndex}>
          {groupIndex > 0 && <Divider sx={{ my: 0.5, opacity: 0.3 }} />}

          <Box sx={{ mb: 0.5 }}>
            <Typography
              component="span"
              sx={{
                color: isDarkMode ? "#9e9e9e" : "#757575",
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.03)",
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                fontSize: "0.75rem",
                display: "inline-block",
                mb: 0.5,
              }}
            >
              {group.timestamp}
            </Typography>

            {group.logs.map((log, logIndex) => {
              const style = getLogStyle(log.type);
              return (
                <Box
                  key={logIndex}
                  sx={{
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                    p: 0.5,
                    borderRadius: 1,
                    mb: 0.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {formatTimestamp(log.message)}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default LogViewer;
