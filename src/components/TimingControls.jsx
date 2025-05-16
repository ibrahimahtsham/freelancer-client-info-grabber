import React from "react";
import { Typography, Box, TextField, MenuItem } from "@mui/material";

const hours = Array.from({ length: 12 }, (_, i) => i + 1);

const TimingControls = ({ label, hour, setHour, ampm, setAmpm }) => (
  <Box>
    <Typography variant="subtitle1" sx={{ mb: 1 }}>
      {label} Timings
    </Typography>
    <Box sx={{ display: "flex", gap: 2 }}>
      <TextField
        select
        label="Hour"
        value={hour}
        onChange={(e) => setHour(Number(e.target.value))}
        fullWidth
      >
        {hours.map((h) => (
          <MenuItem key={h} value={h}>
            {h}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="AM/PM"
        value={ampm}
        onChange={(e) => setAmpm(e.target.value)}
        fullWidth
      >
        <MenuItem value="AM">AM</MenuItem>
        <MenuItem value="PM">PM</MenuItem>
      </TextField>
    </Box>
  </Box>
);

export default TimingControls;
