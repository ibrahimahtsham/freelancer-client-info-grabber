import { useState, useEffect } from "react";
import { Paper, Grid, alpha, useTheme } from "@mui/material";
import EmployeeInformationSection from "./components/EmployeeInformationSection";
import ShiftHoursSection from "./components/ShiftHoursSection";
import ActionButtonsSection from "./components/ActionButtonsSection";
import ColorPickerModal from "./components/ColorPickerModal";
import { getTimeDisplay } from "../../../../utils/dateUtils";

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
            <EmployeeInformationSection
              formData={formData}
              handleChange={handleChange}
              handleColorPickerOpen={handleColorPickerOpen}
              employee={employee}
              sectionStyle={sectionStyle}
              theme={theme}
            />
          </Grid>

          {/* Shift Hours Section */}
          <Grid item xs={12} md={4}>
            <ShiftHoursSection
              formData={formData}
              handleChange={handleChange}
              employee={employee}
              sectionStyle={sectionStyle}
              theme={theme}
              getTimeDisplay={getTimeDisplay}
            />
          </Grid>

          {/* Action Buttons Section */}
          <Grid item xs={12} md={4}>
            <ActionButtonsSection
              employee={employee}
              onCancel={onCancel}
              sectionStyle={sectionStyle}
              theme={theme}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Color Picker Modal */}
      <ColorPickerModal
        open={colorPickerOpen}
        onClose={handleColorPickerClose}
        color={formData.color}
        onColorChange={handleColorChange}
        theme={theme}
      />
    </form>
  );
};

export default EmployeeForm;
