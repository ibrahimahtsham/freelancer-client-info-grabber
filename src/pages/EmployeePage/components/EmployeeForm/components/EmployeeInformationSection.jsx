import { Box, TextField, Typography, Tooltip, alpha } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import Paper from "@mui/material/Paper";

const EmployeeInformationSection = ({
  formData,
  handleChange,
  handleColorPickerOpen,
  employee,
  sectionStyle,
  theme,
}) => {
  return (
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
            justifyContent: "center",
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
                width: "100%",
                height: 60,
                borderRadius: 2,
                bgcolor: formData.color,
                boxShadow: "0px 3px 6px rgba(0,0,0,0.25)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.3)",
                },
              }}
              aria-label="Change employee color"
            />
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default EmployeeInformationSection;
