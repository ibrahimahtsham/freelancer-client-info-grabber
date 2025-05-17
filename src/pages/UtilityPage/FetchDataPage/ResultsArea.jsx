import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import DataTable from "../../../components/DataTable";

const ResultsArea = ({ rows, loading, shouldFetch, limitEnabled }) => {
  return (
    <Box mt={4}>
      {loading && rows.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading data...</Typography>
        </Box>
      ) : rows.length > 0 ? (
        <DataTable rows={rows} loading={loading} />
      ) : shouldFetch ? (
        <Typography>No data found for the selected date range.</Typography>
      ) : (
        <Typography>
          Select a date range and click "Fetch Data" to begin.
          {!limitEnabled &&
            " (No limit applied - may fetch all available data)"}
        </Typography>
      )}
    </Box>
  );
};

export default ResultsArea;
