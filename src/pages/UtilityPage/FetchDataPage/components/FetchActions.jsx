import { Box, Button, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import DatasetIcon from "@mui/icons-material/Dataset";
import DataActions from "./DataActions";
import FetchStatusDisplay from "./FetchStatusDisplay";

const FetchActions = ({
  onFetch,
  onSave,
  loading,
  hasData,
  timer,
  formatTime,
  showApiStats,
  toggleApiStats,
  showLogs,
  toggleLogs,
  error,
  progress,
  progressText,
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DataActions
            onFetch={onFetch}
            onSave={onSave}
            loading={loading}
            hasData={hasData}
          />

          {timer.isRunning && (
            <Chip
              label={`Time: ${formatTime(timer.duration)}`}
              color="primary"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          )}

          {!timer.isRunning && timer.duration !== null && (
            <Chip
              label={`Completed in: ${formatTime(timer.duration)}`}
              color="success"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Box>
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            startIcon={<DatasetIcon />}
            endIcon={showApiStats ? <CloseIcon /> : <ExpandMoreIcon />}
            onClick={toggleApiStats}
            sx={{ mr: 1 }}
          >
            {showApiStats ? "Hide API Stats" : "API Stats"}
          </Button>

          <Button
            variant="outlined"
            size="small"
            color="info"
            startIcon={<InfoIcon />}
            endIcon={showLogs ? <CloseIcon /> : <ExpandMoreIcon />}
            onClick={toggleLogs}
          >
            {showLogs ? "Hide Logs" : "Show Logs"}
          </Button>
        </Box>
      </Box>

      <FetchStatusDisplay
        error={error}
        loading={loading}
        progress={progress}
        progressText={progressText}
      />
    </Box>
  );
};

export default FetchActions;
