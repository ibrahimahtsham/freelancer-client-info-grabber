import { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
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
import { useEmployees } from "../../../../contexts/EmployeeContext";
import { to24Hour } from "../../../../utils/dateUtils";

const TeamComparison = ({ rows }) => {
  // Get employee data from context (cookies)
  const { employees } = useEmployees();

  // Calculate team stats based on time periods
  const teamStats = useMemo(() => {
    if (!rows || !rows.length || !employees || employees.length < 2)
      return null;

    // We'll work with the first two employees in the list
    const firstEmployee = employees[0];
    const secondEmployee = employees[1];

    if (!firstEmployee || !secondEmployee) return null;

    // Get shift data from employees
    const firstShift = {
      start: to24Hour(firstEmployee.startHour, firstEmployee.startAmPm),
      end: to24Hour(firstEmployee.endHour, firstEmployee.endAmPm),
      name: firstEmployee.name,
      id: firstEmployee.id,
    };

    const secondShift = {
      start: to24Hour(secondEmployee.startHour, secondEmployee.startAmPm),
      end: to24Hour(secondEmployee.endHour, secondEmployee.endAmPm),
      name: secondEmployee.name,
      id: secondEmployee.id,
    };

    // Use IDs as keys for stats tracking
    const firstId = firstEmployee.id;
    const secondId = secondEmployee.id;

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

    // Initialize stats object using employee IDs
    const stats = {};
    stats[firstId] = {
      total: 0,
      awarded: 0,
      totalBid: 0,
      totalPaid: 0,
      name: firstEmployee.name,
    };

    stats[secondId] = {
      total: 0,
      awarded: 0,
      totalBid: 0,
      totalPaid: 0,
      name: secondEmployee.name,
    };

    // Process each row
    rows.forEach((row) => {
      const dateTime = parseDateTime(row.projectUploadDate);
      if (!dateTime) return;

      // Check which shift the project belongs to
      let employeeId = null;

      if (isInShift(dateTime.hour, firstShift)) {
        employeeId = firstId;
      } else if (isInShift(dateTime.hour, secondShift)) {
        employeeId = secondId;
      } else {
        // Outside both shifts, skip
        return;
      }

      // Update stats
      stats[employeeId].total++;

      if (row.awarded === "Yes") {
        stats[employeeId].awarded++;
      }

      // Parse bid amount
      const bidAmount = parseFloat(row.yourBidAmount?.replace("$", "") || 0);
      if (!isNaN(bidAmount)) {
        stats[employeeId].totalBid += bidAmount;
      }

      // Parse paid amount
      const paidAmount = parseFloat(
        row.totalPaidMilestones?.replace("$", "") || 0
      );
      if (!isNaN(paidAmount)) {
        stats[employeeId].totalPaid += paidAmount;
      }
    });

    // Calculate derived stats
    const calculate = (employeeId) => {
      const s = stats[employeeId];
      return {
        ...s,
        awardRate: s.total > 0 ? ((s.awarded / s.total) * 100).toFixed(1) : 0,
        avgBid: s.total > 0 ? (s.totalBid / s.total).toFixed(2) : 0,
        avgPaid: s.awarded > 0 ? (s.totalPaid / s.awarded).toFixed(2) : 0,
      };
    };

    // Return results with employee IDs as keys
    const result = {};
    result[firstId] = calculate(firstId);
    result[secondId] = calculate(secondId);

    return result;
  }, [rows, employees]);

  // If no stats or not enough employees, show message
  if (!teamStats || !employees || employees.length < 2) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Team Comparison
        </Typography>
        <Alert severity="info">
          <Typography>
            Team comparison requires at least two employees with shift
            information. Please add employee information in the Employees page.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Get the employee IDs
  const employeeIds = Object.keys(teamStats);
  const firstEmployee = employees[0];
  const secondEmployee = employees[1];

  // Format time for display
  const formatShiftTime = (emp) => {
    if (!emp) return "N/A";
    return `${emp.startHour}${emp.startAmPm.toLowerCase()} - ${
      emp.endHour
    }${emp.endAmPm.toLowerCase()}`;
  };

  // Prepare data for charts
  const compareData = [
    {
      name: teamStats[employeeIds[0]].name,
      Projects: teamStats[employeeIds[0]].total,
      Awarded: teamStats[employeeIds[0]].awarded,
      Paid: parseFloat(teamStats[employeeIds[0]].totalPaid.toFixed(2)),
    },
    {
      name: teamStats[employeeIds[1]].name,
      Projects: teamStats[employeeIds[1]].total,
      Awarded: teamStats[employeeIds[1]].awarded,
      Paid: parseFloat(teamStats[employeeIds[1]].totalPaid.toFixed(2)),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {teamStats[employeeIds[0]].name} vs {teamStats[employeeIds[1]].name}{" "}
        Comparison
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
                {firstEmployee.name}'s Performance
              </Typography>
              <Typography>
                <strong>Shift:</strong> {formatShiftTime(firstEmployee)}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>
                <strong>Projects:</strong> {teamStats[firstEmployee.id].total}
              </Typography>
              <Typography>
                <strong>Awarded:</strong> {teamStats[firstEmployee.id].awarded}{" "}
                ({teamStats[firstEmployee.id].awardRate}%)
              </Typography>
              <Typography>
                <strong>Total Bids:</strong> $
                {teamStats[firstEmployee.id].totalBid.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Avg. Bid:</strong> ${teamStats[firstEmployee.id].avgBid}
              </Typography>
              <Typography>
                <strong>Total Paid:</strong> $
                {teamStats[firstEmployee.id].totalPaid.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Avg. Paid per Award:</strong> $
                {teamStats[firstEmployee.id].avgPaid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {secondEmployee.name}'s Performance
              </Typography>
              <Typography>
                <strong>Shift:</strong> {formatShiftTime(secondEmployee)}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>
                <strong>Projects:</strong> {teamStats[secondEmployee.id].total}
              </Typography>
              <Typography>
                <strong>Awarded:</strong> {teamStats[secondEmployee.id].awarded}{" "}
                ({teamStats[secondEmployee.id].awardRate}%)
              </Typography>
              <Typography>
                <strong>Total Bids:</strong> $
                {teamStats[secondEmployee.id].totalBid.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Avg. Bid:</strong> $
                {teamStats[secondEmployee.id].avgBid}
              </Typography>
              <Typography>
                <strong>Total Paid:</strong> $
                {teamStats[secondEmployee.id].totalPaid.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Avg. Paid per Award:</strong> $
                {teamStats[secondEmployee.id].avgPaid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeamComparison;
