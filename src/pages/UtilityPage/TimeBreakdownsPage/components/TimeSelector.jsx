import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";

const TimeSelector = ({ label, hour, ampm, onHourChange, onAmPmChange }) => (
  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
    <Typography variant="body2" sx={{ minWidth: 80 }}>
      {label}:
    </Typography>
    <FormControl size="small" sx={{ minWidth: 60 }}>
      <Select value={hour} onChange={(e) => onHourChange(e.target.value)}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <MenuItem key={h} value={h}>
            {h}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl size="small" sx={{ minWidth: 70 }}>
      <Select value={ampm} onChange={(e) => onAmPmChange(e.target.value)}>
        <MenuItem value="AM">AM</MenuItem>
        <MenuItem value="PM">PM</MenuItem>
      </Select>
    </FormControl>
  </Box>
);

export default TimeSelector;
