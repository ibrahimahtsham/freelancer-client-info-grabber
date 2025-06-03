import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  ButtonGroup,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
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
} from "date-fns";
import { processHeatmapData } from "../utils/heatmapDataProcessor";
import HeatmapStatsPanel from "./HeatmapStatsPanel";

const heatmapStyles = `
  .react-calendar-heatmap text {
    font-size: 6px;
    fill: #aaa;
  }
  .react-calendar-heatmap .color-empty {
    fill: #eeeeee;
  }
  
  /* Bid count scale (red to green gradient) */
  .react-calendar-heatmap .bid-scale-1 { fill: #ff0000; }
  .react-calendar-heatmap .bid-scale-2 { fill: #ff4000; }
  .react-calendar-heatmap .bid-scale-3 { fill: #ff8000; }
  .react-calendar-heatmap .bid-scale-4 { fill: #ffbf00; }
  .react-calendar-heatmap .bid-scale-5 { fill: #c0ff00; }
  .react-calendar-heatmap .bid-scale-6 { fill: #80ff00; }
  .react-calendar-heatmap .bid-scale-7 { fill: #40ff00; }
  .react-calendar-heatmap .bid-scale-8 { fill: #00ff00; }
  
  /* Time to bid scale (blue to purple gradient) */
  .react-calendar-heatmap .time-scale-1 { fill: #e3f2fd; }
  .react-calendar-heatmap .time-scale-2 { fill: #bbdefb; }
  .react-calendar-heatmap .time-scale-3 { fill: #64b5f6; }
  .react-calendar-heatmap .time-scale-4 { fill: #2196f3; }
  .react-calendar-heatmap .time-scale-5 { fill: #1976d2; }
  .react-calendar-heatmap .time-scale-6 { fill: #7b1fa2; }
  .react-calendar-heatmap .time-scale-7 { fill: #9c27b0; }
  .react-calendar-heatmap .time-scale-8 { fill: #673ab7; }
  
  /* Updated Calendar container styling */
  .team-heatmap-container {
    padding: 10px;
    border-radius: 4px;
    border: 1px solid var(--mui-palette-divider);
    background: var(--mui-palette-background-paper);
    max-width: 600px;
    margin: 0 auto;
  }
  .team-heatmap-container .react-calendar-heatmap {
    width: auto !important;
    height: 500px !important; /* removed the fixed 100px height */
  }
  .team-heatmap-container .react-calendar-heatmap rect {
    stroke-width: 1px;
    rx: 1;
    ry: 1;
    width: 10px !important;    /* new square width */
    height: 10px !important;   /* new square height */
    /* Optional: adding some spacing between squares */
    margin: 10px;
  }
`;

const TeamCalendarHeatmap = ({ rows, employees }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("bids"); // 'bids' or 'time'
  const [selectedEmployee, setSelectedEmployee] = useState(0);

  const firstEmployee = employees[0];
  const secondEmployee = employees[1];

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const heatmapData = useMemo(() => {
    if (!rows?.length || !employees?.length >= 2)
      return {
        employee1: { bids: [], time: [] },
        employee2: { bids: [], time: [] },
      };

    return processHeatmapData(rows, employees, startDate, endDate);
  }, [rows, employees, startDate, endDate]);

  const navigateMonth = (increment) => {
    setCurrentDate((prev) =>
      increment ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const getColorClass = (value, mode) => {
    if (!value || !value.count) return "color-empty";
    const prefix = mode === "bids" ? "bid-scale-" : "time-scale-";
    let intensity;
    if (mode === "bids") {
      intensity = Math.min(Math.max(1, Math.ceil(value.count / 3)), 8);
    } else {
      intensity = Math.min(Math.max(1, Math.ceil(value.count / 60)), 8);
    }
    return `${prefix}${intensity}`;
  };

  const getTooltipContent = (value) => {
    if (!value || !value.date) return null;
    const dateObj = new Date(value.date);
    // Updated to include weekday (e.g., "Sat, Jun 03, 2025")
    const dateStr = format(dateObj, "eee, MMM dd, yyyy");
    if (viewMode === "bids") {
      return `${dateStr}\nBids: ${value.count}\nAvg Time to Bid: ${
        value.avgTimeToBid?.toFixed(1) || 0
      } seconds`;
    } else {
      return `${dateStr}\nBids: ${value.bidCount}\nAvg Time to Bid: ${
        value.count?.toFixed(1) || 0
      } seconds\nMin: ${value.minTime?.toFixed(1) || 0}s, Max: ${
        value.maxTime?.toFixed(1) || 0
      }s`;
    }
  };

  const currentEmployee =
    selectedEmployee === 0 ? firstEmployee : secondEmployee;
  const currentData =
    selectedEmployee === 0
      ? viewMode === "bids"
        ? heatmapData.employee1.bids
        : heatmapData.employee1.time
      : viewMode === "bids"
      ? heatmapData.employee2.bids
      : heatmapData.employee2.time;

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <style>{heatmapStyles}</style>

      <Typography variant="h5" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
        Team Calendar Heatmap Analysis
      </Typography>

      {/* Controls Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Top row: Month Navigation & View Mode */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 1,
                }}
              >
                <ButtonGroup variant="outlined" size="small">
                  <Button onClick={() => navigateMonth(false)}>◀ Prev</Button>
                  <Button onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button onClick={() => navigateMonth(true)}>Next ▶</Button>
                </ButtonGroup>
                <Typography variant="subtitle1">
                  {format(currentDate, "MMMM yyyy")}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  gap: 1,
                }}
              >
                <Typography variant="subtitle2">View Mode:</Typography>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, value) => value !== null && setViewMode(value)}
                  size="small"
                >
                  <ToggleButton value="bids">Bids</ToggleButton>
                  <ToggleButton value="time">Time</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            {/* Bottom row: Employee Selection */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <ToggleButtonGroup
                  value={selectedEmployee}
                  exclusive
                  onChange={(e, value) =>
                    value !== null && setSelectedEmployee(value)
                  }
                  size="small"
                >
                  <ToggleButton value={0}>
                    {firstEmployee?.name || "Employee 1"}
                  </ToggleButton>
                  <ToggleButton value={1}>
                    {secondEmployee?.name || "Employee 2"}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Heatmap Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentEmployee?.name} -{" "}
            {viewMode === "bids" ? "Daily Bid Count" : "Avg Time to Bid"}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Shift: {currentEmployee?.startHour}
            {currentEmployee?.startAmPm?.toLowerCase()} -{" "}
            {currentEmployee?.endHour}
            {currentEmployee?.endAmPm?.toLowerCase()}
          </Typography>
          <Box className="team-heatmap-container" sx={{ mt: 2 }}>
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={currentData}
              classForValue={(value) => getColorClass(value, viewMode)}
              tooltipDataAttrs={(value) => ({
                "data-tooltip-id": "heatmap-tooltip",
                "data-tooltip-content": getTooltipContent(value),
              })}
            />
            <ReactTooltip
              id="heatmap-tooltip"
              place="top"
              style={{ whiteSpace: "pre-line", zIndex: 1000 }}
            />
          </Box>

          {/* Legend */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
              gap: 1,
            }}
          >
            <Typography variant="caption">
              {viewMode === "bids" ? "Fewer bids" : "Faster response"}
            </Typography>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => {
              const colors =
                viewMode === "bids"
                  ? [
                      "#ff0000",
                      "#ff4000",
                      "#ff8000",
                      "#ffbf00",
                      "#c0ff00",
                      "#80ff00",
                      "#40ff00",
                      "#00ff00",
                    ]
                  : [
                      "#e3f2fd",
                      "#bbdefb",
                      "#64b5f6",
                      "#2196f3",
                      "#1976d2",
                      "#7b1fa2",
                      "#9c27b0",
                      "#673ab7",
                    ];
              return (
                <Box
                  key={level}
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: colors[level - 1],
                    border: 1,
                    borderColor: "divider",
                  }}
                />
              );
            })}
            <Typography variant="caption">
              {viewMode === "bids" ? "More bids" : "Slower response"}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Panel */}
      <HeatmapStatsPanel
        data={currentData}
        employee={currentEmployee}
        viewMode={viewMode}
        dateRange={
          format(startDate, "MMM dd") + " - " + format(endDate, "MMM dd, yyyy")
        }
      />
    </Box>
  );
};

export default TeamCalendarHeatmap;
