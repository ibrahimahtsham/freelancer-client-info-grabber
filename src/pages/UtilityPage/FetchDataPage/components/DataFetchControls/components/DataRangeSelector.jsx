import { Box, Typography, Button } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useState } from "react";
import { shouldDisableDate } from "../utils/dateUtils";
import { DATE_PRESETS } from "../utils/constants";

const DateRangeSelector = ({
  fromDateTime,
  setFromDateTime,
  toDateTime,
  setToDateTime,
}) => {
  const [dateError, setDateError] = useState(false);

  // Define the current date/time as max allowed
  const now = new Date();

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

  // Validation function
  const validateDateRange = (fromDate, toDate) => {
    if (!fromDate || !toDate) return true;
    return toDate > fromDate;
  };

  return (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Date & Time Range
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
        {DATE_PRESETS.map((preset) => (
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
    </>
  );
};

export default DateRangeSelector;
