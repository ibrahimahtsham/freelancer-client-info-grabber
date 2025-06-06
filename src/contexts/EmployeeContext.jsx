import { useState, useEffect } from "react";
import { setCookie, getCookie } from "../utils/cookieUtils";
import EmployeeContext from "./EmployeeContextDefinition";

// Default employees data
const defaultEmployees = [
  {
    id: "1",
    name: "Joe",
    color: "#4caf50",
    startHour: 10,
    startAmPm: "PM",
    endHour: 7,
    endAmPm: "AM",
  },
  {
    id: "2",
    name: "Bill",
    color: "#e91e63",
    startHour: 12,
    startAmPm: "PM",
    endHour: 10,
    endAmPm: "PM",
  },
];

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState([]);

  // Load employees from cookies on mount
  useEffect(() => {
    const savedEmployees = getCookie("employees");
    if (
      savedEmployees &&
      Array.isArray(savedEmployees) &&
      savedEmployees.length > 0
    ) {
      setEmployees(savedEmployees);
    } else {
      // Use default employees if no stored data
      setEmployees(defaultEmployees);
      setCookie("employees", defaultEmployees);
    }
  }, []);

  // Save employees to cookies whenever they change
  useEffect(() => {
    if (employees.length > 0) {
      setCookie("employees", employees);
    }
  }, [employees]);

  // Add a new employee
  const addEmployee = (employee) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(), // Simple unique ID
    };
    setEmployees([...employees, newEmployee]);
  };

  // Update an existing employee
  const updateEmployee = (id, updatedEmployee) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id ? { ...emp, ...updatedEmployee } : emp
      )
    );
  };

  // Delete an employee
  const deleteEmployee = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  return (
    <EmployeeContext.Provider
      value={{ employees, addEmployee, updateEmployee, deleteEmployee }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export default EmployeeProvider;
