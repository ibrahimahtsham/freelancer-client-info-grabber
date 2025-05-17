import React from "react";
import { Typography, Box } from "@mui/material";
import DataTable from "../components/DataTable";
import { useUtilityData } from "../hooks/useUtilityData";

const UtilityPage = () => {
  const { rows, loading } = useUtilityData();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Utility Page
      </Typography>
      <Typography>
        Here you can add utility tools or information for your app.
      </Typography>
      <Box mt={4}>
        {loading ? (
          <Typography>Loading data...</Typography>
        ) : (
          <DataTable rows={rows} />
        )}
      </Box>
    </Box>
  );
};

export default UtilityPage;
