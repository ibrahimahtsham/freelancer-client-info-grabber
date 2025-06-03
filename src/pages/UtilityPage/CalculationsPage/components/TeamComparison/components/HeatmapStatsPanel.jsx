import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import { formatCustomTime } from "../utils/timeFormatters";

const HeatmapStatsPanel = ({ data, employee, viewMode, dateRange }) => {
  // Calculate statistics from the data
  const calculateStats = () => {
    if (!data?.length) return null;

    const validData = data.filter((item) => item.count > 0);

    if (viewMode === "bids") {
      const totalBids = validData.reduce((sum, item) => sum + item.count, 0);
      const avgBidsPerDay =
        validData.length > 0 ? totalBids / validData.length : 0;
      const maxBidsInDay = Math.max(...validData.map((item) => item.count), 0);
      const activeDays = validData.length;

      // Calculate time to bid stats
      const timeToBidData = validData.filter((item) => item.avgTimeToBid > 0);
      const avgTimeToBid =
        timeToBidData.length > 0
          ? timeToBidData.reduce((sum, item) => sum + item.avgTimeToBid, 0) /
            timeToBidData.length
          : 0;

      return {
        totalBids,
        avgBidsPerDay: avgBidsPerDay.toFixed(1),
        maxBidsInDay,
        activeDays,
        avgTimeToBid, // return as number for formatting later
      };
    } else {
      // Time to bid mode
      const timeData = validData.filter((item) => item.count > 0);
      const avgTime =
        timeData.length > 0
          ? timeData.reduce((sum, item) => sum + item.count, 0) /
            timeData.length
          : 0;

      const minTime =
        timeData.length > 0
          ? Math.min(...timeData.map((item) => item.minTime || item.count))
          : 0;

      const maxTime =
        timeData.length > 0
          ? Math.max(...timeData.map((item) => item.maxTime || item.count))
          : 0;

      const totalBids = timeData.reduce(
        (sum, item) => sum + (item.bidCount || 1),
        0
      );

      return {
        avgTime, // raw number for formatter
        minTime,
        maxTime,
        totalBids,
        activeDays: timeData.length,
      };
    }
  };

  const stats = calculateStats();

  if (!stats) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Statistics for {employee?.name}
          </Typography>
          <Typography color="text.secondary">
            No data available for the selected period.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Statistics for {employee?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Period: {dateRange}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {viewMode === "bids" ? (
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {stats.totalBids}
                </Typography>
                <Typography variant="caption">Total Bids</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {stats.avgBidsPerDay}
                </Typography>
                <Typography variant="caption">Avg Bids/Day</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {stats.maxBidsInDay}
                </Typography>
                <Typography variant="caption">Max Bids in Day</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {stats.activeDays}
                </Typography>
                <Typography variant="caption">Active Days</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                <strong>Average Time to Bid:</strong>{" "}
                {formatCustomTime(stats.avgTimeToBid)}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {formatCustomTime(stats.avgTime)}
                </Typography>
                <Typography variant="caption">Avg Time to Bid</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {formatCustomTime(stats.minTime)}
                </Typography>
                <Typography variant="caption">Fastest Response</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="error.main">
                  {formatCustomTime(stats.maxTime)}
                </Typography>
                <Typography variant="caption">Slowest Response</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {stats.totalBids}
                </Typography>
                <Typography variant="caption">Total Bids</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default HeatmapStatsPanel;
