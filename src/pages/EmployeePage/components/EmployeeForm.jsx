import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from "@mui/material";
import { ChromePicker } from "react-color";

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    color: "#3f51b5",
    startHour: 9,
    startAmPm: "AM",
    endHour: 5,
    endAmPm: "PM",
  });

  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        color: employee.color || "#3f51b5",
        startHour: employee.startHour || 9,
        startAmPm: employee.startAmPm || "AM",
        endHour: employee.endHour || 5,
        endAmPm: employee.endAmPm || "PM",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleColorChange = (color) => {
    setFormData({ ...formData, color: color.hex });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowColorPicker(!showColorPicker)}
              sx={{
                backgroundColor: formData.color,
                color: "white",
                "&:hover": {
                  backgroundColor: formData.color,
                  opacity: 0.9,
                },
              }}
            >
              {showColorPicker ? "Close Color Picker" : "Select Color"}
            </Button>
            {showColorPicker && (
              <Box sx={{ mt: 2, position: "relative", zIndex: 2 }}>
                <ChromePicker
                  color={formData.color}
                  onChangeComplete={handleColorChange}
                />
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="start-hour-label">Start Hour</InputLabel>
            <Select
              labelId="start-hour-label"
              name="startHour"
              value={formData.startHour}
              onChange={handleChange}
              label="Start Hour"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                <MenuItem key={`start-${hour}`} value={hour}>
                  {hour}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="start-ampm-label">AM/PM</InputLabel>
            <Select
              labelId="start-ampm-label"
              name="startAmPm"
              value={formData.startAmPm}
              onChange={handleChange}
              label="AM/PM"
            >
              <MenuItem value="AM">AM</MenuItem>
              <MenuItem value="PM">PM</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="end-hour-label">End Hour</InputLabel>
            <Select
              labelId="end-hour-label"
              name="endHour"
              value={formData.endHour}
              onChange={handleChange}
              label="End Hour"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                <MenuItem key={`end-${hour}`} value={hour}>
                  {hour}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="end-ampm-label">AM/PM</InputLabel>
            <Select
              labelId="end-ampm-label"
              name="endAmPm"
              value={formData.endAmPm}
              onChange={handleChange}
              label="AM/PM"
            >
              <MenuItem value="AM">AM</MenuItem>
              <MenuItem value="PM">PM</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {employee ? "Update" : "Add"} Employee
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default EmployeeForm;
