import { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Alert,
  Fade,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  Paper,
  Backdrop,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EmployeeList from "./components/EmployeeList";
import EmployeeForm from "./components/EmployeeForm";
import { useEmployees } from "../../contexts/EmployeeContext";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

const EmployeePage = () => {
  const theme = useTheme();
  const { employees, addEmployee, updateEmployee, deleteEmployee } =
    useEmployees();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formActive, setFormActive] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  // Event handlers
  const handleAddClick = () => {
    setFormActive(true);
    setEditingEmployee(null);
  };

  const handleEditClick = (employee) => {
    setFormActive(true);
    setEditingEmployee(employee);
  };

  const handleDeleteClick = (id) => {
    deleteEmployee(id);
    showNotification("Employee deleted successfully", "success");
  };

  const handleFormSubmit = (employeeData) => {
    if (!editingEmployee) {
      addEmployee(employeeData);
      showNotification("Employee added successfully", "success");
    } else {
      updateEmployee(editingEmployee.id, employeeData);
      showNotification("Employee updated successfully", "success");
    }
    setFormActive(false);
    setEditingEmployee(null);
  };

  const handleCancelForm = () => {
    setFormActive(false);
    setEditingEmployee(null);
  };

  const showNotification = (message, severity) => {
    setNotification({ show: true, message, severity });
    setTimeout(
      () => setNotification({ show: false, message: "", severity: "success" }),
      3000
    );
  };

  // Style objects
  const headerStyle = {
    mb: 5,
    p: 3,
    display: "flex",
    alignItems: "center",
    gap: 3,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: "16px 16px 0 0",
    bgcolor: alpha(theme.palette.background.default, 0.6),
  };

  const iconStyle = {
    fontSize: 48,
    color: theme.palette.primary.main,
    p: 1,
    borderRadius: "50%",
    bgcolor: alpha(theme.palette.primary.main, 0.1),
  };

  const formCardStyle = {
    borderRadius: 3,
    border: formActive
      ? `2px solid ${
          !editingEmployee
            ? theme.palette.success.main
            : theme.palette.primary.main
        }`
      : `1px solid ${theme.palette.divider}`,
    height: "100%",
  };

  const formHeaderStyle = {
    p: 3,
    backgroundColor: formActive
      ? alpha(
          !editingEmployee
            ? theme.palette.success.main
            : theme.palette.primary.main,
          0.1
        )
      : theme.palette.background.default,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  };

  const backdropStyle = {
    position: "absolute",
    zIndex: 1,
    backgroundColor: "#333333",
    borderRadius: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  };

  return (
    <Container>
      {/* Page Header */}
      <Paper elevation={0} sx={headerStyle}>
        <PeopleAltIcon sx={iconStyle} />
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
            Employee Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage sales team members, their shifts and profile settings
          </Typography>
        </Box>
      </Paper>

      {/* Notification */}
      <Fade in={notification.show}>
        <Box sx={{ mb: 4 }}>
          {notification.show && (
            <Alert
              severity={notification.severity}
              variant="filled"
              sx={{
                boxShadow: theme.shadows[3],
                borderRadius: 2,
                px: 3,
                py: 1.5,
              }}
            >
              {notification.message}
            </Alert>
          )}
        </Box>
      </Fade>

      {/* Main Content */}
      <Box
        sx={{
          maxWidth: "98%",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Employee List */}
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 3,
                backgroundColor: theme.palette.background.default,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" component="h2" fontWeight="500">
                Sales Team ({employees.length})
              </Typography>
            </Box>
            <Box sx={{ p: 3, maxHeight: "50vh", overflow: "auto" }}>
              <EmployeeList
                employees={employees}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Employee Form */}
        <Box position="relative" sx={{ height: "560px" }}>
          <Card elevation={4} sx={formCardStyle}>
            <Box sx={formHeaderStyle}>
              <Typography
                variant="h6"
                fontWeight="500"
                color={
                  formActive
                    ? !editingEmployee
                      ? "success.main"
                      : "primary.main"
                    : "text.secondary"
                }
              >
                {!editingEmployee
                  ? "Add New Employee"
                  : `Edit ${editingEmployee?.name}`}
              </Typography>
            </Box>
            <Divider />
            <CardContent
              sx={{
                p: 3,
                opacity: formActive ? 1 : 0,
                height: "220px",
                overflow: "auto",
              }}
            >
              <EmployeeForm
                employee={editingEmployee}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
              />
            </CardContent>
          </Card>

          {/* Add Employee Overlay */}
          {!formActive && (
            <Backdrop open={true} sx={backdropStyle}>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: 500, mb: 1 }}
              >
                Add Employee
              </Typography>
              <Fab
                color="primary"
                onClick={handleAddClick}
                size="large"
                sx={{
                  boxShadow: theme.shadows[8],
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: theme.shadows[12],
                  },
                }}
              >
                <AddIcon sx={{ fontSize: 32 }} />
              </Fab>
            </Backdrop>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default EmployeePage;
