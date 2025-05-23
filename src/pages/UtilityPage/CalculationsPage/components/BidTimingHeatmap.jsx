import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  Button,
  ButtonGroup,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  format,
  subWeeks,
  addWeeks,
  startOfWeek,
  endOfWeek,
  subDays,
  addDays,
} from "date-fns";

// Custom CSS with improved spacing for visualization
const heatmapStyles = `
  .react-calendar-heatmap text {
    font-size: 10px;
    fill: #aaa;
  }
  .react-calendar-heatmap .color-empty {
    fill: #eeeeee;
  }
  .react-calendar-heatmap .color-scale-1 { fill: #d6e8fa; }
  .react-calendar-heatmap .color-scale-2 { fill: #abd0f7; }
  .react-calendar-heatmap .color-scale-3 { fill: #7fb6f5; }
  .react-calendar-heatmap .color-scale-4 { fill: #529df2; }
  .react-calendar-heatmap .color-scale-5 { fill: #2584ef; }
  .react-calendar-heatmap .color-scale-6 { fill: #0e6fd5; }
  .react-calendar-heatmap .color-scale-7 { fill: #085bb1; }
  .react-calendar-heatmap .color-scale-8 { fill: #06478d; }
  
  .react-calendar-heatmap .award-scale-1 { fill: #d6f5d6; }
  .react-calendar-heatmap .award-scale-2 { fill: #b0ebb0; }
  .react-calendar-heatmap .award-scale-3 { fill: #89e289; }
  .react-calendar-heatmap .award-scale-4 { fill: #63d863; }
  .react-calendar-heatmap .award-scale-5 { fill: #3dd03d; }
  .react-calendar-heatmap .award-scale-6 { fill: #2bb42b; }
  .react-calendar-heatmap .award-scale-7 { fill: #229922; }
  .react-calendar-heatmap .award-scale-8 { fill: #197d19; }
  
  /* Calendar container styling */
  .calendar-container {
    height: 700px;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 40px; /* Added top padding */
    margin-top: 20px; /* Added top margin */
  }
  .calendar-container .react-calendar-heatmap {
    width: 85%;
    max-width: 900px;
    margin: 0 auto;
    transform: scale(0.7); /* Smaller visualization */
  }
`;

const BidTimingHeatmap = ({ rows }) => {
  // State declarations remain the same
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateBounds, setDateBounds] = useState({
    startDate: null,
    endDate: null,
  });
  const [viewMode, setViewMode] = useState("monthly"); // daily, weekly, monthly

  // Data structure remains the same
  const [bidData, setBidData] = useState({
    daily: [],
    hourly: {},
    dayOfWeek: {},
  });

  const [awardedData, setAwardedData] = useState({
    daily: [],
    hourly: {},
    dayOfWeek: {},
  });

  // Process data logic remains the same
  useEffect(() => {
    if (!rows?.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize data structures
      const dailyBids = {};
      const dailyAwarded = {};
      const hourlyBids = Array(24).fill(0);
      const hourlyAwarded = Array(24).fill(0);
      const dayOfWeekBids = Array(7).fill(0);
      const dayOfWeekAwarded = Array(7).fill(0);

      let minDate = new Date();
      let maxDate = new Date(0); // Jan 1, 1970

      // Process rows
      rows.forEach((row) => {
        if (!row.bid_time) return;

        try {
          const date = new Date(row.bid_time * 1000);
          const dateStr = format(date, "yyyy-MM-dd");
          const hour = date.getHours();
          const dayOfWeek = date.getDay();

          // Update date bounds
          if (date < minDate) minDate = date;
          if (date > maxDate) maxDate = date;

          // Daily counts
          if (!dailyBids[dateStr]) dailyBids[dateStr] = 0;
          dailyBids[dateStr]++;

          // Hourly counts
          hourlyBids[hour]++;

          // Day of week counts
          dayOfWeekBids[dayOfWeek]++;

          // Handle awarded bids
          if (row.award_status === "awarded") {
            if (!dailyAwarded[dateStr]) dailyAwarded[dateStr] = 0;
            dailyAwarded[dateStr]++;
            hourlyAwarded[hour]++;
            dayOfWeekAwarded[dayOfWeek]++;
          }
        } catch (err) {
          console.warn("Error processing date:", row.bid_time, err);
        }
      });

      // Convert daily counts to array format for calendar heatmap
      const dailyBidsArray = Object.entries(dailyBids).map(([date, count]) => ({
        date,
        count,
        value: count,
      }));

      const dailyAwardedArray = Object.entries(dailyAwarded).map(
        ([date, count]) => ({
          date,
          count,
          value: count,
        })
      );

      // Set date bounds for display
      setDateBounds({
        startDate: startOfMonth(subMonths(minDate, 1)),
        endDate: endOfMonth(addMonths(maxDate, 1)),
      });

      // Update state with processed data
      setBidData({
        daily: dailyBidsArray,
        hourly: hourlyBids,
        dayOfWeek: dayOfWeekBids,
      });

      setAwardedData({
        daily: dailyAwardedArray,
        hourly: hourlyAwarded,
        dayOfWeek: dayOfWeekAwarded,
      });
    } catch (error) {
      console.error("Error processing bid data:", error);
      setError("Failed to process bid timing data");
    } finally {
      setIsLoading(false);
    }
  }, [rows]);

  // Get view date range based on viewMode
  const viewDates = useMemo(() => {
    let startDate, endDate;

    switch (viewMode) {
      case "daily":
        startDate = subDays(currentDate, 3); // Show a week centered on current date
        endDate = addDays(currentDate, 3);
        break;
      case "weekly":
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
        break;
      case "monthly":
      default:
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
    }

    return { startDate, endDate };
  }, [currentDate, viewMode]);

  // Handle navigation based on viewMode
  const navigateView = (increment) => {
    switch (viewMode) {
      case "daily":
        setCurrentDate((prevDate) =>
          increment ? addDays(prevDate, 1) : subDays(prevDate, 1)
        );
        break;
      case "weekly":
        setCurrentDate((prevDate) =>
          increment ? addWeeks(prevDate, 1) : subWeeks(prevDate, 1)
        );
        break;
      case "monthly":
      default:
        setCurrentDate((prevDate) =>
          increment ? addMonths(prevDate, 1) : subMonths(prevDate, 1)
        );
        break;
    }
  };

  // Format current view date range for display
  const getViewDateLabel = () => {
    switch (viewMode) {
      case "daily":
        return format(currentDate, "MMMM d, yyyy");
      case "weekly":
        return `Week of ${format(viewDates.startDate, "MMM d")} - ${format(
          viewDates.endDate,
          "MMM d, yyyy"
        )}`;
      case "monthly":
      default:
        return format(viewDates.startDate, "MMMM yyyy");
    }
  };

  const getColorClass = (count, isAwarded = false) => {
    if (!count) return "color-empty";

    const prefix = isAwarded ? "award-scale-" : "color-scale-";
    if (count <= 1) return `${prefix}1`;
    if (count <= 2) return `${prefix}2`;
    if (count <= 4) return `${prefix}3`;
    if (count <= 6) return `${prefix}4`;
    if (count <= 9) return `${prefix}5`;
    if (count <= 12) return `${prefix}6`;
    if (count <= 15) return `${prefix}7`;
    return `${prefix}8`;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getTooltipDataAttr = (value) => {
    if (!value || !value.date) return null;

    return {
      "data-tooltip-id": "calendar-tooltip",
      "data-tooltip-content": `Date: ${value.date}, Bids: ${value.count}`,
    };
  };

  // Handle view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Empty data state
  if (!bidData.daily.length) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Bid Timing Analysis
        </Typography>
        <Typography>No bid data available for analysis.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <style>{heatmapStyles}</style>

      <Typography variant="h5" gutterBottom>
        Bid Timing Analysis
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Bids" />
          <Tab label="Awarded Bids" />
        </Tabs>
      </Box>

      {/* Added ViewMode controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            aria-label="view mode"
          >
            <ToggleButton value="daily" aria-label="daily view">
              Daily
            </ToggleButton>
            <ToggleButton value="weekly" aria-label="weekly view">
              Weekly
            </ToggleButton>
            <ToggleButton value="monthly" aria-label="monthly view">
              Monthly
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="subtitle1">{getViewDateLabel()}</Typography>
          <ButtonGroup variant="outlined" size="small">
            <Button onClick={() => navigateView(false)}>&lt; Prev</Button>
            <Button onClick={() => navigateView(true)}>Next &gt;</Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Calendar heatmap with increased height and top spacing */}
      <Card sx={{ mb: 4, overflow: "hidden" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {activeTab === 0
              ? "Bid Activity Calendar"
              : "Awarded Projects Calendar"}
          </Typography>
          <Box className="calendar-container">
            <CalendarHeatmap
              startDate={dateBounds.startDate || viewDates.startDate}
              endDate={dateBounds.endDate || viewDates.endDate}
              values={activeTab === 0 ? bidData.daily : awardedData.daily}
              classForValue={(value) =>
                getColorClass(value?.count, activeTab === 1)
              }
              tooltipDataAttrs={getTooltipDataAttr}
            />
            <ReactTooltip id="calendar-tooltip" />
          </Box>
        </CardContent>
      </Card>

      {/* Bar charts with increased height (5x) and more width */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bids by Hour of Day
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  height: "750px",
                  width: "100%",
                  padding: "20px 10px",
                  overflow: "hidden",
                  overflowX: "auto", // Enable horizontal scrolling if needed
                }}
              >
                {(activeTab === 0 ? bidData.hourly : awardedData.hourly).map(
                  (count, hour) => (
                    <Box
                      key={hour}
                      sx={{
                        width: "5rem", // Fixed wider width (5x more than before)
                        minWidth: "5rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mx: 1, // Increased spacing between bars
                        height: "100%",
                      }}
                      data-tooltip-id="hour-tooltip"
                      data-tooltip-content={`Hour ${hour}: ${count} bids`}
                    >
                      <Box
                        sx={{
                          height: `${Math.min(
                            100,
                            (count /
                              Math.max(
                                0.1,
                                ...(activeTab === 0
                                  ? bidData.hourly
                                  : awardedData.hourly)
                              )) *
                              100
                          )}%`,
                          width: "100%",
                          backgroundColor:
                            activeTab === 0 ? "#2584ef" : "#3dd03d",
                          borderRadius: "3px 3px 0 0",
                          mt: "auto",
                          minHeight: "2px",
                        }}
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {hour}
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bids by Day of Week
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  height: "750px",
                  width: "100%",
                  padding: "20px 40px",
                  justifyContent: "space-evenly", // More even spacing
                }}
              >
                {(activeTab === 0
                  ? bidData.dayOfWeek
                  : awardedData.dayOfWeek
                ).map((count, day) => (
                  <Box
                    key={day}
                    sx={{
                      width: "13rem", // Much wider (5x)
                      minWidth: "12rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      mx: 2, // Increased spacing
                    }}
                    data-tooltip-id="day-tooltip"
                    data-tooltip-content={`${
                      [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ][day]
                    }: ${count} bids`}
                  >
                    <Box
                      sx={{
                        height: `${Math.min(
                          100,
                          (count /
                            Math.max(
                              0.1,
                              ...(activeTab === 0
                                ? bidData.dayOfWeek
                                : awardedData.dayOfWeek)
                            )) *
                            100
                        )}%`,
                        width: "100%",
                        backgroundColor:
                          activeTab === 0 ? "#2584ef" : "#3dd03d",
                        borderRadius: "3px 3px 0 0",
                        mt: "auto",
                        minHeight: "2px",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, fontWeight: "bold" }}
                    >
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ReactTooltip id="hour-tooltip" />
      <ReactTooltip id="day-tooltip" />
    </Paper>
  );
};

export default BidTimingHeatmap;
