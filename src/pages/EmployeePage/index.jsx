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
import { useEmployees } from "../../contexts/EmployeeHooks";
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

  return (
    <Container maxWidth="lg">
      {/* Page Header */}
      <Paper
        elevation={1}
        sx={{
          mb: 4,
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <PeopleAltIcon
          sx={{
            fontSize: 40,
            color: "primary.main",
            p: 1,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          }}
        />
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
        <Box sx={{ mb: 3 }}>
          {notification.show && (
            <Alert
              severity={notification.severity}
              variant="filled"
              sx={{ borderRadius: 1 }}
            >
              {notification.message}
            </Alert>
          )}
        </Box>
      </Fade>

      {/* Main Content */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Employee List */}
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: "background.default",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" component="h2" fontWeight="500">
              Sales Team ({employees.length})
            </Typography>
          </Box>
          <CardContent sx={{ p: 2, maxHeight: "50vh", overflow: "auto" }}>
            <EmployeeList
              employees={employees}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </CardContent>
        </Card>

        {/* Employee Form Section */}
        <Box sx={{ position: "relative", minHeight: 560 }}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              border: formActive
                ? `1px solid ${
                    !editingEmployee ? "success.main" : "primary.main"
                  }`
                : `1px solid ${theme.palette.divider}`,
              height: "100%",
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: formActive
                  ? alpha(
                      !editingEmployee
                        ? theme.palette.success.main
                        : theme.palette.primary.main,
                      0.05
                    )
                  : "background.default",
              }}
            >
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
                p: 2,
                opacity: formActive ? 1 : 0,
                minHeight: 400,
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
            <Backdrop
              open={true}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.6)
                    : alpha(theme.palette.grey[100], 0.8),
                backdropFilter: "blur(3px)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  p: 3,
                  borderRadius: 2,
                  maxWidth: 240,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Add New Team Member
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Create a new employee profile with shift hours and color
                  coding
                </Typography>
                <Fab
                  color="primary"
                  onClick={handleAddClick}
                  sx={{
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <AddIcon />
                </Fab>
              </Box>
            </Backdrop>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default EmployeePage;
