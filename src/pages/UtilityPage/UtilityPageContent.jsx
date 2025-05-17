import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import FetchDataPage from "./FetchDataPage";
import TimeBreakdownsPage from "./TimeBreakdownsPage";
import CalculationsPage from "./CalculationsPage";
import StoredDataSelector from "./StoredDataSelector";
import { useUtility } from "./UtilityContext";

// Now we can use useUtility here!
const UtilityPageContent = () => {
  const { rows, dataVersion } = useUtility();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    console.log(
      `UtilityPageContent: rows updated to ${rows.length} items, version ${dataVersion}`
    );
  }, [rows, dataVersion]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <StoredDataSelector />

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="utility tabs"
        >
          <Tab label="Fetch Data" />
          <Tab label="Time Breakdowns" />
          <Tab label="Calculations" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <FetchDataPage />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TimeBreakdownsPage />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <CalculationsPage />
      </TabPanel>
    </Box>
  );
};

// TabPanel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      sx={{ mt: 2 }}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

export default UtilityPageContent;
