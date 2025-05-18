import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  alpha,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const ShiftHoursSection = ({
  formData,
  handleChange,
  employee,
  sectionStyle,
  theme,
  getTimeDisplay,
}) => {
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
              <Typography variant="h5" color="primary.main" fontWeight="medium">
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
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <MenuItem key={`start-${hour}`} value={hour}>
                      {hour}
                    </MenuItem>
                  ))}
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
              <Typography variant="h5" color="error.main" fontWeight="medium">
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
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <MenuItem key={`end-${hour}`} value={hour}>
                      {hour}
                    </MenuItem>
                  ))}
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                ((formData.startHour + (formData.startAmPm === "PM" ? 12 : 0)) /
                  24) *
                100
              }%`,
              right: `${
                100 -
                ((formData.endHour + (formData.endAmPm === "PM" ? 12 : 0)) /
                  24) *
                  100
              }%`,
              bgcolor: formData.color,
              boxShadow: `0 0 8px ${formData.color}`,
              border: `2px solid ${theme.palette.background.paper}`,
              borderRadius: 1,
              zIndex: 2,
            }}
          />

          {/* Time markers */}
          {["12 AM", "6 AM", "12 PM", "6 PM", "12 AM"].map((marker, idx) => (
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
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ShiftHoursSection;
