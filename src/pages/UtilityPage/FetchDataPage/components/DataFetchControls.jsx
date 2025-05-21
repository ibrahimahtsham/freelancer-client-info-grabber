import {
  Box,
  Grid,
  Paper,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  MenuItem,
  Tooltip,
  Typography,
  RadioGroup,
  Radio,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DateRangeControls from "./DateRangeControls";

// Define data fetch types
const FETCH_TYPES = [
  {
    value: "complete",
    label: "Complete Data (All Sources)",
    description:
      "Fetches bids, projects, threads, milestones and client details",
  },
  {
    value: "bids_only",
    label: "Bids Only",
    description: "Fetches only bid data with minimal project info",
  },
  {
    value: "projects_only",
    label: "Project Details Only",
    description: "Fetches only detailed project information",
  },
  {
    value: "clients_only",
    label: "Client Profiles Only",
    description: "Fetches only client profile information",
  },
  {
    value: "threads_only",
    label: "Threads Only",
    description: "Fetches conversation threads",
  },
];

const DataFetchControls = ({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  limitEnabled,
  setLimitEnabled,
  limit,
  setLimit,
  fetchType,
  setFetchType,
}) => {
  const selectedFetchType =
    FETCH_TYPES.find((type) => type.value === fetchType) || FETCH_TYPES[0];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3}>
        {/* Date Range Controls */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" gutterBottom>
            Date Range
          </Typography>
          <DateRangeControls
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
          />
        </Grid>

        {/* Fetch Type Controls */}
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle1" gutterBottom>
            Data Type
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={fetchType}
              onChange={(e) => setFetchType(e.target.value)}
            >
              {FETCH_TYPES.map((type) => (
                <FormControlLabel
                  key={type.value}
                  value={type.value}
                  control={<Radio />}
                  label={
                    <Tooltip title={type.description} placement="right">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2">{type.label}</Typography>
                        <InfoIcon
                          fontSize="small"
                          sx={{ ml: 1, opacity: 0.7 }}
                        />
                      </Box>
                    </Tooltip>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Limit Controls */}
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle1" gutterBottom>
            Result Limit
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={limitEnabled}
                  onChange={(e) => setLimitEnabled(e.target.checked)}
                />
              }
              label="Enable Limit"
            />

            <TextField
              label="Max Results"
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
              disabled={!limitEnabled}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip title="Limits the total number of results fetched from the API">
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DataFetchControls;
