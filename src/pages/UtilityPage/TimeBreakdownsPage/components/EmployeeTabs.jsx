import { Box, Tabs, Tab } from "@mui/material";

/**
 * Tabs for selecting different employees
 */
const EmployeeTabs = ({ employeeList, validIndex, handleTabChange }) => (
  <Box sx={{ mb: 3 }}>
    <Tabs
      value={validIndex}
      onChange={handleTabChange}
      variant="scrollable"
      scrollButtons="auto"
    >
      {employeeList.map((emp) => (
        <Tab
          key={emp.id}
          label={emp.name}
          sx={{
            borderBottom: `3px solid ${emp.color}`,
          }}
        />
      ))}
    </Tabs>
  </Box>
);

export default EmployeeTabs;
