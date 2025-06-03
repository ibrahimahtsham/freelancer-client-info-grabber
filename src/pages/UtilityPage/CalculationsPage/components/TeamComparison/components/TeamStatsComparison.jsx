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

const TeamStatsComparison = ({ teamStats, employees }) => {
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
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {teamStats[employeeIds[0]].name} vs {teamStats[employeeIds[1]].name}{" "}
        Performance Comparison
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
        <Grid item xs={12} md={6}>
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

        <Grid item xs={12} md={6}>
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

export default TeamStatsComparison;
