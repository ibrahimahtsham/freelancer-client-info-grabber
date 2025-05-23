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
  Button,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";

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

// Define presets for date ranges
const presets = [
  {
    label: "Last 7 days",
    getValue: () => {
      const to = new Date();

      const from = new Date();
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0); // Set to beginning of day (12:00 AM)

      return { from, to };
    },
  },
  {
    label: "This month",
    getValue: () => {
      const to = new Date();

      const from = new Date();
      from.setDate(1); // First day of current month
      from.setHours(0, 0, 0, 0); // Set to beginning of day (12:00 AM)

      return { from, to };
    },
  },
  {
    label: "Last month",
    getValue: () => {
      // Last day of previous month (set date to 0 of current month)
      const to = new Date();
      to.setDate(0); // Last day of previous month
      to.setHours(23, 59, 59, 999); // Set to end of day (11:59:59 PM)

      // First day of previous month
      const from = new Date(to); // Copy the date from 'to'
      from.setDate(1); // First day of the month
      from.setHours(0, 0, 0, 0); // Set to beginning of day (12:00 AM)

      return { from, to };
    },
  },
  {
    label: "All time",
    getValue: () => {
      // To: Current date at end of day
      const to = new Date();

      // From: Jan 1st of current year at beginning of day
      const from = new Date();
      from.setMonth(0); // January
      from.setDate(1); // 1st day
      from.setHours(0, 0, 0, 0);

      return { from, to };
    },
  },
];

// Should disable weekends
const shouldDisableDate = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

const DataFetchControls = ({
  fromDateTime,
  setFromDateTime,
  toDateTime,
  setToDateTime,
  limitEnabled,
  setLimitEnabled,
  limit,
  setLimit,
  fetchType,
  setFetchType,
}) => {
  const [dateError, setDateError] = useState(false);

  // Validation function
  const validateDateRange = (fromDate, toDate) => {
    if (!fromDate || !toDate) return true;
    return toDate > fromDate;
  };

  // Handle from date change with validation
  const handleFromDateChange = (newValue) => {
    const isValid = validateDateRange(newValue, toDateTime);
    setDateError(!isValid);
    setFromDateTime(newValue);

    // If new "from" date is after current "to" date, update "to" date
    if (toDateTime && newValue > toDateTime) {
      // Set "to" to be same as "from" but 1 hour later
      const newToDate = new Date(newValue);
      newToDate.setHours(newToDate.getHours() + 1);
      setToDateTime(newToDate);
    }
  };

  // Handle to date change with validation
  const handleToDateChange = (newValue) => {
    const isValid = validateDateRange(fromDateTime, newValue);
    setDateError(!isValid);
    setToDateTime(newValue);
  };

  // Define the current date/time as max allowed
  const now = new Date();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={3}>
          {/* DateTime Range Controls */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Date & Time Range
            </Typography>

            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <DateTimePicker
                label="From"
                value={fromDateTime}
                onChange={handleFromDateChange}
                format="dd/MM/yyyy hh:mm a"
                ampm={true}
                minutesStep={5}
                shouldDisableDate={shouldDisableDate}
                maxDateTime={now} // Prevent selecting future dates
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: dateError,
                    helperText: dateError ? "Invalid date range" : "",
                  },
                }}
              />

              <DateTimePicker
                label="To"
                value={toDateTime}
                onChange={handleToDateChange}
                format="dd/MM/yyyy hh:mm a"
                ampm={true}
                minutesStep={5}
                minDateTime={fromDateTime} // Can't be before fromDateTime
                maxDateTime={now} // Prevent selecting future dates
                shouldDisableDate={shouldDisableDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: dateError,
                    helperText: dateError ? "Invalid date range" : "",
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const { from, to } = preset.getValue();
                    setFromDateTime(from);
                    setToDateTime(to);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </Box>
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
      </LocalizationProvider>
    </Paper>
  );
};

export default DataFetchControls;
