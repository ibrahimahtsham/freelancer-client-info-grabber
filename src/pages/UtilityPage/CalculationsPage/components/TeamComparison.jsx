import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TeamComparison = ({ rows }) => {
  // Calculate team stats based on time periods
  const teamStats = useMemo(() => {
    if (!rows || !rows.length) return null;

    // Process based on Ibrahim's shift (10PM-7AM) and Hafsa's shift (12PM-10PM)
    const ibrahimShift = {
      start: 22, // 10 PM
      end: 7, // 7 AM
      name: "Ibrahim",
    };

    const hafsaShift = {
      start: 12, // 12 PM
      end: 22, // 10 PM
      name: "Hafsa",
    };

    // Helper to parse dates & check if in shift time
    const parseDateTime = (dateString) => {
      if (!dateString || dateString === "N/A") return null;

      try {
        // Parse DD-MM-YYYY HH:MM:SS AM/PM format
        const parts = dateString.split(" ");
        if (parts.length < 2) return null;

        const datePart = parts[0];
        const timePart = parts[1];
        const ampmPart = parts[2];

        // Parse date
        const [day, month, year] = datePart.split("-").map(Number);

        // Parse time
        const [hours, minutes] = timePart.split(":").map(Number);

        // Convert to 24-hour format
        let hour24 = hours;
        if (ampmPart === "PM" && hours < 12) hour24 += 12;
        else if (ampmPart === "AM" && hours === 12) hour24 = 0;

        return {
          hour: hour24,
          date: new Date(year, month - 1, day, hour24, minutes),
        };
      } catch (e) {
        console.warn("Failed to parse date time:", dateString, e);
        return null;
      }
    };

    // Check if time falls within a shift
    const isInShift = (hour, shift) => {
      if (hour === null) return false;

      // Handle shifts that span across midnight
      if (shift.start > shift.end) {
        return hour >= shift.start || hour < shift.end;
      } else {
        return hour >= shift.start && hour < shift.end;
      }
    };

    // Initialize stats object
    const stats = {
      ibrahim: {
        total: 0,
        awarded: 0,
        totalBid: 0,
        totalPaid: 0,
      },
      hafsa: {
        total: 0,
        awarded: 0,
        totalBid: 0,
        totalPaid: 0,
      },
    };

    // Process each row
    rows.forEach((row) => {
      const dateTime = parseDateTime(row.projectUploadDate);
      if (!dateTime) return;

      // Check which shift the project belongs to
      let person = null;

      if (isInShift(dateTime.hour, ibrahimShift)) {
        person = "ibrahim";
      } else if (isInShift(dateTime.hour, hafsaShift)) {
        person = "hafsa";
      } else {
        // Outside both shifts, skip
        return;
      }

      // Update stats
      stats[person].total++;

      if (row.awarded === "Yes") {
        stats[person].awarded++;
      }

      // Parse bid amount
      const bidAmount = parseFloat(row.yourBidAmount?.replace("$", "") || 0);
      if (!isNaN(bidAmount)) {
        stats[person].totalBid += bidAmount;
      }

      // Parse paid amount
      const paidAmount = parseFloat(
        row.totalPaidMilestones?.replace("$", "") || 0
      );
      if (!isNaN(paidAmount)) {
        stats[person].totalPaid += paidAmount;
      }
    });

    // Calculate derived stats
    const calculate = (person) => {
      const s = stats[person];
      return {
        ...s,
        awardRate: s.total > 0 ? ((s.awarded / s.total) * 100).toFixed(1) : 0,
        avgBid: s.total > 0 ? (s.totalBid / s.total).toFixed(2) : 0,
        avgPaid: s.awarded > 0 ? (s.totalPaid / s.awarded).toFixed(2) : 0,
      };
    };

    return {
      ibrahim: calculate("ibrahim"),
      hafsa: calculate("hafsa"),
    };
  }, [rows]);

  // If no stats, show message
  if (!teamStats) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Team Comparison
        </Typography>
        <Typography>No data available for team comparison.</Typography>
      </Box>
    );
  }

  // Prepare data for charts
  const compareData = [
    {
      name: "Ibrahim",
      Projects: teamStats.ibrahim.total,
      Awarded: teamStats.ibrahim.awarded,
      Paid: parseFloat(teamStats.ibrahim.totalPaid.toFixed(2)),
    },
    {
      name: "Hafsa",
      Projects: teamStats.hafsa.total,
      Awarded: teamStats.hafsa.awarded,
      Paid: parseFloat(teamStats.hafsa.totalPaid.toFixed(2)),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Ibrahim vs Hafsa Comparison
      </Typography>

      {/* Comparison chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Metrics
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={compareData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="Projects"
                fill="#8884d8"
                name="Total Projects"
              />
              <Bar
                yAxisId="left"
                dataKey="Awarded"
                fill="#82ca9d"
                name="Awarded Projects"
              />
              <Bar
                yAxisId="right"
                dataKey="Paid"
                fill="#ffc658"
                name="Total Payment ($)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed stats comparison */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ibrahim's Performance
              </Typography>
              <Typography>
                <strong>Shift:</strong> 10 PM - 7 AM
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>
                <strong>Projects:</strong> {teamStats.ibrahim.total}
              </Typography>
              <Typography>
                <strong>Awarded:</strong> {teamStats.ibrahim.awarded} (
                {teamStats.ibrahim.awardRate}%)
              </Typography>
              <Typography>
                <strong>Total Bids:</strong> $
                {teamStats.ibrahim.totalBid.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Avg. Bid:</strong> ${teamStats.ibrahim.avgBid}
              </Typography>
              <Typography>
                <strong>Total Paid:</strong> $
                {teamStats.ibrahim.totalPaid.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Avg. Paid per Award:</strong> $
                {teamStats.ibrahim.avgPaid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hafsa's Performance
              </Typography>
              <Typography>
                <strong>Shift:</strong> 12 PM - 10 PM
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>
                <strong>Projects:</strong> {teamStats.hafsa.total}
              </Typography>
              <Typography>
                <strong>Awarded:</strong> {teamStats.hafsa.awarded} (
                {teamStats.hafsa.awardRate}%)
              </Typography>
              <Typography>
                <strong>Total Bids:</strong> $
                {teamStats.hafsa.totalBid.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Avg. Bid:</strong> ${teamStats.hafsa.avgBid}
              </Typography>
              <Typography>
                <strong>Total Paid:</strong> $
                {teamStats.hafsa.totalPaid.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Avg. Paid per Award:</strong> ${teamStats.hafsa.avgPaid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeamComparison;
