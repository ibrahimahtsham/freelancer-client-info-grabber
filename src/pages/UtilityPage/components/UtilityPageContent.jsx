import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import FetchDataPage from "../FetchDataPage";
import TimeBreakdownsPage from "../TimeBreakdownsPage";
import CalculationsPage from "../CalculationsPage";
import StoredDataSelector from "../FetchDataPage/StoredDataSelector";
import { useUtility } from "../UtilityContext/hooks";
import TabPanel from "./TabPanel";

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

export default UtilityPageContent;
