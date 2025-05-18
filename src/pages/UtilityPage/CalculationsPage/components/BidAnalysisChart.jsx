import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const BidAnalysisChart = ({ bidsData, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading bids data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Failed to load bids data: {error}
      </Alert>
    );
  }

  if (!bidsData || !bidsData.bids || !bidsData.bids.length) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No bids data available. This may require additional API permissions.
      </Alert>
    );
  }

  // Prepare bids by award status
  const statusCounts = bidsData.bids.reduce((acc, bid) => {
    acc[bid.award_status] = (acc[bid.award_status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  // Summary stats
  const totalBids = bidsData.totalBids;
  const awardedBids = bidsData.awardedBids;
  const awardRate =
    totalBids > 0 ? ((awardedBids / totalBids) * 100).toFixed(1) : 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Bid Analysis
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bid Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} bids`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bid Summary
              </Typography>

              <Box sx={{ my: 2 }}>
                <Typography variant="body1">
                  <strong>Total Bids:</strong> {totalBids}
                </Typography>
                <Typography variant="body1">
                  <strong>Awarded/Accepted Bids:</strong> {awardedBids}
                </Typography>
                <Typography variant="body1">
                  <strong>Award Rate:</strong> {awardRate}%
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Bid Status Breakdown:
              </Typography>

              {Object.entries(statusCounts).map(([status, count]) => (
                <Typography key={status} variant="body2">
                  <strong>
                    {status.charAt(0).toUpperCase() + status.slice(1)}:
                  </strong>{" "}
                  {count} bids ({((count / totalBids) * 100).toFixed(1)}%)
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BidAnalysisChart;
