import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Grid,
  Alert,
} from "@mui/material";
import EmployeeList from "./components/EmployeeList";
import EmployeeForm from "./components/EmployeeForm";
import { useEmployees } from "../../contexts/EmployeeContext";

const EmployeePage = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } =
    useEmployees();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingEmployee(null);
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setIsAdding(false);
  };

  const handleDeleteClick = (id) => {
    deleteEmployee(id);
    showNotification("Employee deleted successfully", "success");
  };

  const handleFormSubmit = (employeeData) => {
    if (isAdding) {
      addEmployee(employeeData);
      showNotification("Employee added successfully", "success");
    } else if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
      showNotification("Employee updated successfully", "success");
    }
    setIsAdding(false);
    setEditingEmployee(null);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
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
      <Typography variant="h4" gutterBottom>
        Employee Management
      </Typography>
      <Typography variant="body1" paragraph>
        Manage employee shifts and profiles. Changes are saved automatically via
        browser cookies.
      </Typography>

      {notification.show && (
        <Alert severity={notification.severity} sx={{ mb: 2 }}>
          {notification.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Employee List</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddClick}
                disabled={isAdding}
              >
                Add Employee
              </Button>
            </Box>
            <EmployeeList
              employees={employees}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          {(isAdding || editingEmployee) && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {isAdding ? "Add New Employee" : "Edit Employee"}
              </Typography>
              <EmployeeForm
                employee={editingEmployee}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
              />
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmployeePage;
