import { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import FetchDataPage from "../FetchDataPage";
import TimeBreakdownsPage from "../TimeBreakdownsPage";
import CalculationsPage from "../CalculationsPage";
import StoredDataSelector from "./StoredDataSelector";
import UserStatsPage from "../UserStatsPage";
import TabPanel from "./TabPanel";

const UtilityPageContent = () => {
  const [tabValue, setTabValue] = useState(0);

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
          <Tab label="User Stats" />
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

      <TabPanel value={tabValue} index={3}>
        <UserStatsPage />
      </TabPanel>
    </Box>
  );
};

export default UtilityPageContent;
