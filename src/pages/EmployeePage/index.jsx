import { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Alert,
  Fade,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  Paper,
  Stack,
  Button,
  Backdrop,
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
        elevation={0}
        sx={{
          mb: 5,
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: "16px 16px 0 0",
          bgcolor: alpha(theme.palette.background.default, 0.6),
        }}
      >
        <PeopleAltIcon
          sx={{
            fontSize: 48,
            color: theme.palette.primary.main,
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

      {/* Main Content - Vertical Stack with increased width */}
      <Stack
        spacing={4}
        sx={{
          maxWidth: "95%", // Increased from 85%
          mx: "auto",
        }}
      >
        {/* Employee List with increased height */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
          }}
        >
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

        {/* Employee Form - Always visible but with overlay when inactive */}
        <Box position="relative" sx={{ height: formActive ? "auto" : "250px" }}>
          <Card
            elevation={4}
            sx={{
              borderRadius: 3,
              border:
                !editingEmployee && formActive
                  ? `2px solid ${theme.palette.success.main}`
                  : editingEmployee && formActive
                  ? `2px solid ${theme.palette.primary.main}`
                  : `1px solid ${theme.palette.divider}`,
              position: "relative",
              height: formActive ? "auto" : "100%",
            }}
          >
            <Box
              sx={{
                p: 3,
                backgroundColor:
                  !editingEmployee && formActive
                    ? alpha(theme.palette.success.main, 0.1)
                    : editingEmployee && formActive
                    ? alpha(theme.palette.primary.main, 0.1)
                    : theme.palette.background.default,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="500"
                color={
                  !editingEmployee && formActive
                    ? "success.main"
                    : formActive
                    ? "primary.main"
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
                filter: formActive ? "none" : "grayscale(0.6)",
              }}
            >
              <EmployeeForm
                employee={editingEmployee}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
              />
            </CardContent>
          </Card>

          {/* Overlay when form is inactive */}
          {!formActive && (
            <Backdrop
              open={!formActive}
              sx={{
                position: "absolute",
                zIndex: 1,
                backgroundColor: "rgba(0,0,0,0.7)",
                borderRadius: 3,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                size="large"
                sx={{
                  borderRadius: 6,
                  px: 5,
                  py: 1.5,
                  boxShadow: theme.shadows[3],
                  minWidth: 200,
                  borderWidth: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                  },
                }}
              >
                Add Employee
              </Button>
            </Backdrop>
          )}
        </Box>
      </Stack>
    </Container>
  );
};

export default EmployeePage;
