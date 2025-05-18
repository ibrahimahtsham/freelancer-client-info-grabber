import {
  Box,
  TextField,
  Typography,
  Button,
  Tooltip,
  alpha,
} from "@mui/material";
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
            <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
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
  );
};

export default EmployeeInformationSection;
