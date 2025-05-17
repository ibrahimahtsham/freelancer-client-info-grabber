import React, { useMemo } from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";
import DataTable from "../../components/DataTable";
import { useUtility } from "./UtilityContext";
import { isInDateRange, isInTimeRange } from "../../utils/dateUtils";

const TimeBreakdownsPage = () => {
  const { rows, loading } = useUtility();

  // Calculate different breakdowns of the data
  const breakdowns = useMemo(() => {
    // Helper to check if a project is awarded
    const isAwarded = (row) => row.awarded === "Yes";

    // Helper to parse dates in DD-MM-YYYY format
    const parseDate = (dateString) => {
      if (!dateString || dateString === "N/A") return null;

      // If the date includes time, split and take just the date part
      const datePart = dateString.split(" ")[0];

      // Parse DD-MM-YYYY format
      const [day, month, year] = datePart.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    // Morning: 6AM-12PM
    const morningRows = rows.filter((row) =>
      isInTimeRange(parseDate(row.projectUploadDate), 6, 12)
    );

    // Afternoon: 12PM-5PM
    const afternoonRows = rows.filter((row) =>
      isInTimeRange(row.projectUploadDate, 12, 17)
    );

    // Evening: 5PM-9PM
    const eveningRows = rows.filter((row) =>
      isInTimeRange(row.projectUploadDate, 17, 21)
    );

    // Night: 9PM-6AM
    const nightRows = rows.filter((row) =>
      isInTimeRange(row.projectUploadDate, 21, 6)
    );

    return {
      morningRows,
      afternoonRows,
      eveningRows,
      nightRows,
      morningAwarded: morningRows.filter(isAwarded),
      afternoonAwarded: afternoonRows.filter(isAwarded),
      eveningAwarded: eveningRows.filter(isAwarded),
      nightAwarded: nightRows.filter(isAwarded),
    };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Time Breakdowns
        </Typography>
        <Typography>
          Please fetch data first using the Fetch Data tab.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Time Breakdowns
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Showing time breakdowns for {rows.length} projects
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Morning Projects (6AM - 12PM)
        </Typography>
        <DataTable rows={breakdowns.morningRows} loading={loading} />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Afternoon Projects (12PM - 5PM)
        </Typography>
        <DataTable rows={breakdowns.afternoonRows} loading={loading} />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Evening Projects (5PM - 9PM)
        </Typography>
        <DataTable rows={breakdowns.eveningRows} loading={loading} />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Night Projects (9PM - 6AM)
        </Typography>
        <DataTable rows={breakdowns.nightRows} loading={loading} />
      </Box>
    </Box>
  );
};

export default TimeBreakdownsPage;
