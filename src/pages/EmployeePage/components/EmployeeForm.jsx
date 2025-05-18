import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  useTheme,
  Paper,
  alpha,
} from "@mui/material";
import { ChromePicker } from "react-color";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

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

  // Styled form sections to match the inactive state aesthetic
  const formSectionStyle = {
    p: 2.5,
    mb: 3,
    borderRadius: "10px",
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    border: `1px solid ${theme.palette.divider}`,
    backdropFilter: "blur(8px)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      boxShadow: theme.shadows[2],
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "12px",
          backgroundColor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Box sx={formSectionStyle}>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            sx={{
              mb: 2,
              color: employee
                ? theme.palette.primary.main
                : theme.palette.success.main,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: employee
                  ? theme.palette.primary.main
                  : theme.palette.success.main,
                display: "inline-block",
              }}
            />
            Employee Information
          </Typography>

          <TextField
            fullWidth
            label="Employee Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
            placeholder="Enter employee name"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Employee Color
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: "10px",
                bgcolor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.4)
                    : theme.palette.grey[50],
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                        borderRadius: "8px",
                      },
                    },
                  }}
                />
              </Box>
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "background.paper",
                  borderRadius: "8px",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    bgcolor: formData.color,
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                  }}
                />
                <Typography variant="body2" fontWeight={500}>
                  {formData.color.toUpperCase()}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        <Box sx={formSectionStyle}>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            sx={{
              mb: 2,
              color: employee
                ? theme.palette.primary.main
                : theme.palette.success.main,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: employee
                  ? theme.palette.primary.main
                  : theme.palette.success.main,
                display: "inline-block",
              }}
            />
            Shift Hours
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Start Time
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="start-hour-label">Hour</InputLabel>
                  <Select
                    labelId="start-hour-label"
                    name="startHour"
                    value={formData.startHour}
                    onChange={handleChange}
                    label="Hour"
                    sx={{ borderRadius: "10px" }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <MenuItem key={`start-${hour}`} value={hour}>
                        {hour}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="start-ampm-label">AM/PM</InputLabel>
                  <Select
                    labelId="start-ampm-label"
                    name="startAmPm"
                    value={formData.startAmPm}
                    onChange={handleChange}
                    label="AM/PM"
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                End Time
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="end-hour-label">Hour</InputLabel>
                  <Select
                    labelId="end-hour-label"
                    name="endHour"
                    value={formData.endHour}
                    onChange={handleChange}
                    label="Hour"
                    sx={{ borderRadius: "10px" }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <MenuItem key={`end-${hour}`} value={hour}>
                        {hour}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="end-ampm-label">AM/PM</InputLabel>
                  <Select
                    labelId="end-ampm-label"
                    name="endAmPm"
                    value={formData.endAmPm}
                    onChange={handleChange}
                    label="AM/PM"
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: "10px",
              pl: 2,
              pr: 2,
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
              borderRadius: "10px",
              pl: 2,
              pr: 2,
              boxShadow: theme.shadows[3],
              "&:hover": {
                boxShadow: theme.shadows[6],
              },
            }}
          >
            {employee ? "Update" : "Add Employee"}
          </Button>
        </Box>
      </Paper>
    </form>
  );
};

export default EmployeeForm;
