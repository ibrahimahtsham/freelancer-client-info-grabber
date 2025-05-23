import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ResponsiveHeatMap } from "@nivo/heatmap";

const BidTimingHeatmap = ({ rows }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [awardedData, setAwardedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    if (!rows?.length) {
      setIsLoading(false);
      setHeatmapData([]);
      setAwardedData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create default data structure with zeros to ensure every field exists
      const createEmptyDataset = () =>
        days.map((day) => {
          const dayData = { day };
          for (let hour = 0; hour < 24; hour++) {
            dayData[`${hour}`] = 0;
          }
          return dayData;
        });

      const bidsByHourDay = createEmptyDataset();
      const awardedByHourDay = createEmptyDataset();

      // Process rows to count bids by hour and day
      rows.forEach((row) => {
        if (!row.bid_time) return;

        try {
          const date = new Date(row.bid_time * 1000);
          const hour = date.getHours();
          const dayOfWeek = days[date.getDay()];

          // Find the corresponding day in our data structure
          const dayIndex = bidsByHourDay.findIndex((d) => d.day === dayOfWeek);
          if (dayIndex !== -1) {
            bidsByHourDay[dayIndex][`${hour}`] += 1;

            if (row.award_status === "awarded") {
              awardedByHourDay[dayIndex][`${hour}`] += 1;
            }
          }
        } catch (err) {
          console.warn("Error processing bid time:", row.bid_time, err);
        }
      });

      setHeatmapData(bidsByHourDay);
      setAwardedData(awardedByHourDay);
    } catch (error) {
      console.error("Error generating heatmap data:", error);
      setError(error.message || "Failed to process heatmap data");

      // Set empty but valid data structure on error
      const emptyData = days.map((day) => {
        const obj = { day };
        for (let i = 0; i < 24; i++) obj[`${i}`] = 0;
        return obj;
      });

      setHeatmapData(emptyData);
      setAwardedData(emptyData);
    } finally {
      setIsLoading(false);
    }
  }, [rows]);

  // Render loading state if data is still being processed
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if processing failed
  if (error) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Bid Timing Analysis
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography>
          There was an error processing the data for the heatmap visualization.
        </Typography>
      </Box>
    );
  }

  // Don't try to render heatmap with empty data
  if (!heatmapData.length) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Bid Timing Analysis
        </Typography>
        <Typography>No data available to display heatmap.</Typography>
      </Box>
    );
  }

  // Simpler rendering approach for the heatmap to avoid undefined data issues
  const renderSimpleHeatmap = (data, colorScheme, title) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 400, position: "relative" }}>
          {data && data.length > 0 ? (
            <ResponsiveHeatMap
              data={data}
              keys={Array.from({ length: 24 }, (_, i) => `${i}`)}
              indexBy="day"
              margin={{ top: 50, right: 60, bottom: 60, left: 80 }}
              forceSquare={false}
              axisTop={{
                orient: "top",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -90,
                legend: "Hour of Day",
                legendOffset: 40,
              }}
              axisRight={null}
              axisBottom={null}
              axisLeft={{
                orient: "left",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Day of Week",
                legendPosition: "middle",
                legendOffset: -60,
              }}
              cellOpacity={1}
              cellBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
              colors={{ type: "sequential", scheme: colorScheme }}
              hoverTarget="cell"
              animate={false}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography>No data available</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Bid Timing Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderSimpleHeatmap(heatmapData, "blues", "Bids by Hour & Day")}
        </Grid>

        <Grid item xs={12} md={6}>
          {renderSimpleHeatmap(
            awardedData,
            "greens",
            "Awarded Projects by Hour & Day"
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BidTimingHeatmap;
