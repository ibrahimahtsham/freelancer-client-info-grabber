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
  Typography,
  Divider,
  alpha,
  Paper,
  useTheme,
  Stack,
} from "@mui/material";
import { ChromePicker } from "react-color";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import BadgeIcon from "@mui/icons-material/Badge";

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    color: "#3f51b5",
    startHour: 9,
    startAmPm: "AM",
    endHour: 5,
    endAmPm: "PM",
  });

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
    } else {
      // Reset to defaults when not editing
      setFormData({
        name: "",
        color: "#3f51b5",
        startHour: 9,
        startAmPm: "AM",
        endHour: 5,
        endAmPm: "PM",
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
      <Stack spacing={3}>
        {/* Employee Name Section */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
              color: theme.palette.text.secondary,
            }}
          >
            <BadgeIcon /> Employee Information
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.background.default, 0.7),
              borderRadius: 2,
            }}
          >
            <TextField
              fullWidth
              label="Employee Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
              placeholder="Enter employee name"
              InputProps={{
                sx: { borderRadius: 2, py: 0.5 },
              }}
              size="medium"
            />
          </Paper>
        </Box>

        {/* Color Selection Section - Reduced size */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
              color: theme.palette.text.secondary,
            }}
          >
            <ColorLensIcon /> Employee Color
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.background.default, 0.7),
              borderRadius: 2,
              maxHeight: "250px", // Reduced height
              overflow: "hidden",
            }}
          >
            <ChromePicker
              color={formData.color}
              onChangeComplete={handleColorChange}
              disableAlpha
              styles={{
                default: {
                  picker: {
                    width: "100%",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                  },
                },
              }}
            />
          </Paper>
        </Box>

        {/* Shift Hours Section - Each field takes exactly 25% width */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
              color: theme.palette.text.secondary,
            }}
          >
            <AccessTimeIcon /> Shift Hours
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.background.default, 0.7),
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={3} sx={{ width: "25%" }}>
                <Typography variant="body2" gutterBottom fontWeight="500">
                  Start Hour
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="start-hour-label">Hour</InputLabel>
                  <Select
                    labelId="start-hour-label"
                    name="startHour"
                    value={formData.startHour}
                    onChange={handleChange}
                    label="Hour"
                    sx={{ borderRadius: 2, ".MuiSelect-select": { py: 1 } }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <MenuItem key={`start-${hour}`} value={hour}>
                        {hour}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={3} sx={{ width: "25%" }}>
                <Typography variant="body2" gutterBottom fontWeight="500">
                  Start AM/PM
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="start-ampm-label">AM/PM</InputLabel>
                  <Select
                    labelId="start-ampm-label"
                    name="startAmPm"
                    value={formData.startAmPm}
                    onChange={handleChange}
                    label="AM/PM"
                    sx={{ borderRadius: 2, ".MuiSelect-select": { py: 1 } }}
                  >
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={3} sx={{ width: "25%" }}>
                <Typography variant="body2" gutterBottom fontWeight="500">
                  End Hour
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="end-hour-label">Hour</InputLabel>
                  <Select
                    labelId="end-hour-label"
                    name="endHour"
                    value={formData.endHour}
                    onChange={handleChange}
                    label="Hour"
                    sx={{ borderRadius: 2, ".MuiSelect-select": { py: 1 } }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <MenuItem key={`end-${hour}`} value={hour}>
                        {hour}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={3} sx={{ width: "25%" }}>
                <Typography variant="body2" gutterBottom fontWeight="500">
                  End AM/PM
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="end-ampm-label">AM/PM</InputLabel>
                  <Select
                    labelId="end-ampm-label"
                    name="endAmPm"
                    value={formData.endAmPm}
                    onChange={handleChange}
                    label="AM/PM"
                    sx={{ borderRadius: 2, ".MuiSelect-select": { py: 1 } }}
                  >
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Action Button - Smaller vertical spacing */}
        <Box
          sx={{ mt: 1, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Stack direction="row" spacing={3} justifyContent="center">
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<CancelIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              color={employee ? "primary" : "success"}
              startIcon={<SaveIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1,
                minWidth: 180,
              }}
            >
              {employee ? "Update Employee" : "Add Employee"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </form>
  );
};

export default EmployeeForm;
