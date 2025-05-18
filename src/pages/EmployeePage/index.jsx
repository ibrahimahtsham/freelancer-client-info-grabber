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

      {/* Main Content - Vertical Stack */}
      <Stack
        spacing={4}
        sx={{
          maxWidth: "85%",
          mx: "auto",
        }}
      >
        {/* Employee List - Now on top */}
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" component="h2" fontWeight="500">
                Sales Team ({employees.length})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                sx={{
                  borderRadius: 6,
                  px: 3,
                  boxShadow: theme.shadows[2],
                }}
              >
                Add Employee
              </Button>
            </Box>
            <Box sx={{ p: 3, maxHeight: "60vh", overflow: "auto" }}>
              <EmployeeList
                employees={employees}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Employee Form - Now below, conditionally rendered */}
        {formActive && (
          <Fade in={formActive}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                border: !editingEmployee
                  ? `2px solid ${theme.palette.success.main}`
                  : `2px solid ${theme.palette.primary.main}`,
              }}
            >
              <Box
                sx={{
                  p: 3,
                  backgroundColor: !editingEmployee
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.primary.main, 0.1),
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="500"
                  color={!editingEmployee ? "success.main" : "primary.main"}
                >
                  {!editingEmployee
                    ? "Add New Employee"
                    : `Edit ${editingEmployee?.name}`}
                </Typography>
              </Box>
              <Divider />
              <CardContent sx={{ p: 4 }}>
                <EmployeeForm
                  employee={editingEmployee}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancelForm}
                />
              </CardContent>
            </Card>
          </Fade>
        )}
      </Stack>
    </Container>
  );
};

export default EmployeePage;
