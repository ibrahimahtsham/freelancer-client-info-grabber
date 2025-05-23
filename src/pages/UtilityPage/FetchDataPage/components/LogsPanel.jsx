import { Box, Typography, Button, Paper, Collapse } from "@mui/material";
import APICallsMonitor from "./APICallsMonitor";
import LogViewer from "./LogViewer";

const LogsPanel = ({
  showApiStats,
  apiCalls,
  resetApiStats,
  showLogs,
  logs,
  clearLogs,
  logsEndRef,
}) => {
  return (
    <>
      {/* API Calls Monitor */}
      <Collapse in={showApiStats}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <APICallsMonitor stats={apiCalls} onReset={resetApiStats} />
        </Paper>
      </Collapse>

      {/* Log Viewer */}
      <Collapse in={showLogs}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            maxHeight: "300px",
            overflow: "auto",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle2">Operation Logs</Typography>
            <Button size="small" onClick={clearLogs}>
              Clear
            </Button>
          </Box>
          <LogViewer logs={logs} />
          <div ref={logsEndRef} />
        </Paper>
      </Collapse>
    </>
  );
};

export default LogsPanel;
