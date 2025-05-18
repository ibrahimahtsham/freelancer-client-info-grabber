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
  Stack,
  Modal,
  IconButton,
  Fade,
  Tooltip,
} from "@mui/material";
import { ChromePicker } from "react-color";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkIcon from "@mui/icons-material/Work";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import CloseIcon from "@mui/icons-material/Close";

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
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  useEffect(() => {
    setFormData(
      employee
        ? {
            name: employee.name || "",
            color: employee.color || "#3f51b5",
            startHour: employee.startHour || 9,
            startAmPm: employee.startAmPm || "AM",
            endHour: employee.endHour || 5,
            endAmPm: employee.endAmPm || "PM",
          }
        : {
            name: "",
            color: "#3f51b5",
            startHour: 9,
            startAmPm: "AM",
            endHour: 5,
            endAmPm: "PM",
          }
    );
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

  const handleColorPickerOpen = () => setColorPickerOpen(true);
  const handleColorPickerClose = () => setColorPickerOpen(false);
  const getTimeDisplay = (hour, ampm) => `${hour}:00 ${ampm}`;

  // Common section styles
  const sectionStyle = {
    p: 3,
    height: 450,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.background.paper, 0.6),
    border: `1px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "column",
  };

  // Hour/time box styles
  const timeBoxStyle = {
    p: 2,
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    bgcolor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.background.default, 0.3)
        : alpha(theme.palette.background.paper, 0.8),
    height: "100%",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Grid container spacing={3}>
          {/* Employee Information Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={sectionStyle}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <WorkIcon
                  sx={{
                    fontSize: 20,
                    mr: 1,
                    color: employee ? "primary.main" : "success.main",
                  }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  color={employee ? "primary.main" : "success.main"}
                >
                  Employee Information
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Employee Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Enter employee name"
                sx={{ mb: 3 }}
              />

              {/* Color selector */}
              <Box sx={{ mt: "auto" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FormatColorFillIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Employee Color
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.background.paper, 0.4)
                        : theme.palette.grey[50],
                  }}
                >
                  <Tooltip title="Click to change color">
                    <Box
                      onClick={handleColorPickerOpen}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: formData.color,
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />
                  </Tooltip>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ mb: 0.5 }}
                    >
                      {formData.color.toUpperCase()}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleColorPickerOpen}
                      sx={{ textTransform: "none" }}
                    >
                      Change Color
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Shift Hours Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={sectionStyle}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <AccessTimeIcon
                  sx={{
                    fontSize: 20,
                    mr: 1,
                    color: employee ? "primary.main" : "success.main",
                  }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  color={employee ? "primary.main" : "success.main"}
                >
                  Shift Hours
                </Typography>
              </Box>

              {/* Time selection */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Start Time */}
                <Grid item xs={6}>
                  <Box sx={timeBoxStyle}>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                      Start Time
                    </Typography>

                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="primary.main"
                        fontWeight="medium"
                      >
                        {getTimeDisplay(formData.startHour, formData.startAmPm)}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <FormControl fullWidth size="small">
                        <InputLabel id="start-hour-label">Hour</InputLabel>
                        <Select
                          labelId="start-hour-label"
                          name="startHour"
                          value={formData.startHour}
                          onChange={handleChange}
                          label="Hour"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (hour) => (
                              <MenuItem key={`start-${hour}`} value={hour}>
                                {hour}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small">
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
                    </Stack>
                  </Box>
                </Grid>

                {/* End Time */}
                <Grid item xs={6}>
                  <Box sx={timeBoxStyle}>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                      End Time
                    </Typography>

                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="error.main"
                        fontWeight="medium"
                      >
                        {getTimeDisplay(formData.endHour, formData.endAmPm)}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <FormControl fullWidth size="small">
                        <InputLabel id="end-hour-label">Hour</InputLabel>
                        <Select
                          labelId="end-hour-label"
                          name="endHour"
                          value={formData.endHour}
                          onChange={handleChange}
                          label="Hour"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (hour) => (
                              <MenuItem key={`end-${hour}`} value={hour}>
                                {hour}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small">
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
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              {/* Improved hours visualization */}
              <Box
                sx={{
                  p: 2,
                  mt: "auto",
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.3),
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Working Hours Visualization
                </Typography>

                <Box
                  sx={{
                    height: 36,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.grey[800], 0.6)
                        : alpha(theme.palette.grey[200], 0.8),
                    borderRadius: 2,
                    position: "relative",
                    overflow: "hidden",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {/* Enhanced colored bar for better visibility */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${
                        ((formData.startHour +
                          (formData.startAmPm === "PM" ? 12 : 0)) /
                          24) *
                        100
                      }%`,
                      right: `${
                        100 -
                        ((formData.endHour +
                          (formData.endAmPm === "PM" ? 12 : 0)) /
                          24) *
                          100
                      }%`,
                      bgcolor: formData.color,
                      boxShadow: `0 0 8px ${formData.color}`,
                      borderRadius: 1,
                      zIndex: 2,
                    }}
                  />

                  {/* Time markers */}
                  {["12 AM", "6 AM", "12 PM", "6 PM", "12 AM"].map(
                    (marker, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: `${idx * 25}%`,
                          width: 1,
                          bgcolor: alpha(theme.palette.text.secondary, 0.3),
                          "&::after": {
                            content: `"${marker}"`,
                            position: "absolute",
                            top: "100%",
                            left: "-12px",
                            fontSize: "0.7rem",
                            color: theme.palette.text.secondary,
                            whiteSpace: "nowrap",
                          },
                        }}
                      />
                    )
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Action Buttons Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={sectionStyle}>
              {/* Top half - Add/Update Button */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "50%",
                  pb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  color={employee ? "primary.main" : "success.main"}
                  sx={{ mb: 3, fontWeight: 500 }}
                >
                  {employee ? "Update Employee" : "Add New Employee"}
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  color={employee ? "primary" : "success"}
                  startIcon={<SaveIcon />}
                  size="large"
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: theme.shadows[3],
                    fontWeight: 500,
                    fontSize: "1rem",
                    "&:hover": {
                      boxShadow: theme.shadows[5],
                    },
                  }}
                >
                  {employee ? "Update" : "Add Employee"}
                </Button>
              </Box>

              <Divider sx={{ borderStyle: "dashed" }} />

              {/* Bottom half - Cancel Button */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "50%",
                  pt: 2,
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Cancel this operation and return to previous view
                </Typography>

                <Button
                  variant="outlined"
                  onClick={onCancel}
                  startIcon={<CancelIcon />}
                  size="large"
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Color Picker Modal */}
      <Modal
        open={colorPickerOpen}
        onClose={handleColorPickerClose}
        closeAfterTransition
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Fade in={colorPickerOpen}>
          <Paper
            elevation={4}
            sx={{
              width: "auto",
              maxWidth: 320,
              p: 3,
              position: "relative",
              borderRadius: 2,
            }}
          >
            <IconButton
              size="small"
              onClick={handleColorPickerClose}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
              Choose Employee Color
            </Typography>

            <ChromePicker
              color={formData.color}
              onChangeComplete={handleColorChange}
              disableAlpha
              styles={{
                default: {
                  picker: {
                    width: "100%",
                    boxShadow: "none",
                  },
                },
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    bgcolor: formData.color,
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                    mr: 1,
                  }}
                />
                <Typography variant="body2" fontWeight={500}>
                  {formData.color.toUpperCase()}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="small"
                onClick={handleColorPickerClose}
                sx={{
                  bgcolor: formData.color,
                  "&:hover": {
                    bgcolor: alpha(formData.color, 0.8),
                  },
                }}
              >
                Apply Color
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Modal>
    </form>
  );
};

export default EmployeeForm;
