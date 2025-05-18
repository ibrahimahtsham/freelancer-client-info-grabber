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

  const handleColorPickerOpen = () => {
    setColorPickerOpen(true);
  };

  const handleColorPickerClose = () => {
    setColorPickerOpen(false);
  };

  // Get display time
  const getTimeDisplay = (hour, ampm) => {
    return `${hour}:00 ${ampm}`;
  };

  // Styled form sections to match the inactive state aesthetic
  const formSectionStyle = {
    p: 3,
    mb: 3,
    borderRadius: "10px",
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    border: `1px solid ${theme.palette.divider}`,
    backdropFilter: "blur(8px)",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    "&:hover": {
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      boxShadow: theme.shadows[2],
    },
  };

  const timeBoxStyle = {
    p: 2.5,
    borderRadius: "10px",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor:
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
          borderRadius: "12px",
          backgroundColor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Grid container spacing={3}>
          {/* Employee Information Section */}
          <Grid item xs={12} md={6}>
            <Box sx={formSectionStyle}>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                sx={{
                  mb: 3,
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
                <WorkIcon sx={{ fontSize: 18, mr: 0.5 }} />
                Employee Information
              </Typography>

              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
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
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                    },
                  }}
                />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5, display: "flex", alignItems: "center" }}
                  >
                    <FormatColorFillIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Employee Color
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      borderRadius: "10px",
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.background.paper, 0.4)
                          : theme.palette.grey[50],
                    }}
                  >
                    <Tooltip title="Click to preview">
                      <Box
                        onClick={handleColorPickerOpen}
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: "8px",
                          bgcolor: formData.color,
                          boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: "0px 3px 6px rgba(0,0,0,0.3)",
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
                        sx={{
                          borderRadius: 5,
                          textTransform: "none",
                          fontSize: "0.75rem",
                          py: 0.25,
                        }}
                      >
                        Change Color
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Shift Hours Section */}
          <Grid item xs={12} md={6}>
            <Box sx={formSectionStyle}>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                sx={{
                  mb: 3,
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
                <AccessTimeIcon sx={{ fontSize: 18, mr: 0.5 }} />
                Shift Hours
              </Typography>

              {/* Time boxes - horizontal at all screen sizes */}
              <Grid container spacing={2} sx={{ mb: 2, flexGrow: 1 }}>
                <Grid item xs={6}>
                  <Box sx={timeBoxStyle}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
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
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: "medium",
                        }}
                      >
                        {getTimeDisplay(formData.startHour, formData.startAmPm)}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mt: "auto" }}
                    >
                      <FormControl fullWidth size="small">
                        <InputLabel id="start-hour-label">Hour</InputLabel>
                        <Select
                          labelId="start-hour-label"
                          name="startHour"
                          value={formData.startHour}
                          onChange={handleChange}
                          label="Hour"
                          sx={{ borderRadius: "10px" }}
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
                          sx={{ borderRadius: "10px" }}
                        >
                          <MenuItem value="AM">AM</MenuItem>
                          <MenuItem value="PM">PM</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={timeBoxStyle}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
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
                        sx={{
                          color: theme.palette.error.main,
                          fontWeight: "medium",
                        }}
                      >
                        {getTimeDisplay(formData.endHour, formData.endAmPm)}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mt: "auto" }}
                    >
                      <FormControl fullWidth size="small">
                        <InputLabel id="end-hour-label">Hour</InputLabel>
                        <Select
                          labelId="end-hour-label"
                          name="endHour"
                          value={formData.endHour}
                          onChange={handleChange}
                          label="Hour"
                          sx={{ borderRadius: "10px" }}
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
                          sx={{ borderRadius: "10px" }}
                        >
                          <MenuItem value="AM">AM</MenuItem>
                          <MenuItem value="PM">PM</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              {/* Visual representation of hours */}
              <Box
                sx={{
                  px: 2,
                  py: 2,
                  borderRadius: "10px",
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
                    height: 28,
                    bgcolor: alpha(theme.palette.grey[300], 0.3),
                    borderRadius: 2,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
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
                      borderRadius: 2,
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
                          bgcolor: alpha(theme.palette.text.secondary, 0.4),
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
            </Box>
          </Grid>
        </Grid>

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

      {/* Color Picker Modal */}
      <Modal
        open={colorPickerOpen}
        onClose={handleColorPickerClose}
        closeAfterTransition
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Fade in={colorPickerOpen}>
          <Paper
            elevation={6}
            sx={{
              width: "auto",
              maxWidth: "90%",
              outline: "none",
              p: 3,
              position: "relative",
              borderRadius: "12px",
            }}
          >
            <IconButton
              size="small"
              onClick={handleColorPickerClose}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                "&:hover": {
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
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
                    borderRadius: "8px",
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
                    borderRadius: "6px",
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
                  borderRadius: "8px",
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
