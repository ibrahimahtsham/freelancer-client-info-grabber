import React from "react";
import { TextField, Box } from "@mui/material";

const DateRangeControls = ({ fromDate, setFromDate, toDate, setToDate }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <TextField
      label="From Date"
      type="date"
      InputLabelProps={{ shrink: true }}
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
    />
    <TextField
      label="To Date"
      type="date"
      InputLabelProps={{ shrink: true }}
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
    />
  </Box>
);

export default DateRangeControls;
