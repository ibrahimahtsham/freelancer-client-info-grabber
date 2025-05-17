import React, { useMemo } from "react";
import { Box, Typography, Paper, Grid, Card, CardContent } from "@mui/material";
import { useUtility } from "./UtilityContext";

const CalculationsPage = () => {
  const { rows } = useUtility();

  // Calculate statistics from the data
  const stats = useMemo(() => {
    if (!rows.length) return null;

    // Helper to parse dates in DD-MM-YYYY format
    const parseDate = (dateString) => {
      if (!dateString || dateString === "N/A") return null;

      try {
        // If the date includes time, split and take just the date part
        const datePart = dateString.split(" ")[0];

        // Parse DD-MM-YYYY format
        const [day, month, year] = datePart.split("-").map(Number);
        return new Date(year, month - 1, day);
      } catch (e) {
        console.warn("Failed to parse date:", dateString);
        return null;
      }
    };

    // Total projects
    const totalProjects = rows.length;

    // Awarded projects
    const awardedProjects = rows.filter((row) => row.awarded === "Yes").length;
    const awardRate =
      totalProjects > 0
        ? ((awardedProjects / totalProjects) * 100).toFixed(2)
        : 0;

    // Total bid amount
    const totalBidAmount = rows.reduce((sum, row) => {
      const amount = parseFloat(row.yourBidAmount?.replace("$", "") || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Total paid amount
    const totalPaidAmount = rows.reduce((sum, row) => {
      const amount = parseFloat(row.totalPaidMilestones?.replace("$", "") || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Helper to check if a date is within a specific time range
    const isInTimeRange = (date, startHour, endHour) => {
      if (!date) return false;
      const hours = date.getHours();
      return hours >= startHour && hours < endHour;
    };

    // Projects by time of day
    const morningProjects = rows.filter(
      (row) =>
        row.projectUploadDate &&
        isInTimeRange(parseDate(row.projectUploadDate), 6, 12)
    ).length;

    const afternoonProjects = rows.filter(
      (row) =>
        row.projectUploadDate &&
        isInTimeRange(parseDate(row.projectUploadDate), 12, 17)
    ).length;

    const eveningProjects = rows.filter(
      (row) =>
        row.projectUploadDate &&
        isInTimeRange(parseDate(row.projectUploadDate), 17, 21)
    ).length;

    const nightProjects = rows.filter(
      (row) =>
        row.projectUploadDate &&
        (isInTimeRange(parseDate(row.projectUploadDate), 21, 24) ||
          isInTimeRange(parseDate(row.projectUploadDate), 0, 6))
    ).length;

    return {
      totalProjects,
      awardedProjects,
      awardRate,
      totalBidAmount,
      totalPaidAmount,
      morningProjects,
      afternoonProjects,
      eveningProjects,
      nightProjects,
    };
  }, [rows]);

  if (!stats) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Calculations
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
        Calculations
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Projects
              </Typography>
              <Typography variant="h4">{stats.totalProjects}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Awarded Projects
              </Typography>
              <Typography variant="h4">
                {stats.awardedProjects} ({stats.awardRate}%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Bid Amount
              </Typography>
              <Typography variant="h4">
                ${stats.totalBidAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Paid Amount
              </Typography>
              <Typography variant="h4">
                ${stats.totalPaidAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Projects by Time of Day
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Morning (6AM - 12PM)
              </Typography>
              <Typography variant="h4">{stats.morningProjects}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Afternoon (12PM - 5PM)
              </Typography>
              <Typography variant="h4">{stats.afternoonProjects}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Evening (5PM - 9PM)
              </Typography>
              <Typography variant="h4">{stats.eveningProjects}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Night (9PM - 6AM)
              </Typography>
              <Typography variant="h4">{stats.nightProjects}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CalculationsPage;
