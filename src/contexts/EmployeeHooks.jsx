import { useContext } from "react";
import EmployeeContext from "./EmployeeContextDefinition";

/**
 * Custom hook to access employee data and functions
 * Must be used within an EmployeeProvider component
 */
export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployees must be used within an EmployeeProvider");
  }
  return context;
}
