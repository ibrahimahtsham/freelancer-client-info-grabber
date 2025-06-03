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

// Custom CSS for the heatmap colors with proper sizing
const heatmapStyles = `
  .react-calendar-heatmap text {
    font-size: 6px;
    fill: #aaa;
  }
  .react-calendar-heatmap .color-empty {
    fill: #eeeeee;
  }
  
  /* Bid count scale (red to green gradient) */
  .react-calendar-heatmap .bid-scale-1 { fill: #ffebee; }
  .react-calendar-heatmap .bid-scale-2 { fill: #ffcdd2; }
  .react-calendar-heatmap .bid-scale-3 { fill: #ef5350; }
  .react-calendar-heatmap .bid-scale-4 { fill: #f44336; }
  .react-calendar-heatmap .bid-scale-5 { fill: #ff9800; }
  .react-calendar-heatmap .bid-scale-6 { fill: #ffeb3b; }
  .react-calendar-heatmap .bid-scale-7 { fill: #8bc34a; }
  .react-calendar-heatmap .bid-scale-8 { fill: #4caf50; }
  
  /* Time to bid scale (blue to purple gradient) */
  .react-calendar-heatmap .time-scale-1 { fill: #e3f2fd; }
  .react-calendar-heatmap .time-scale-2 { fill: #bbdefb; }
  .react-calendar-heatmap .time-scale-3 { fill: #64b5f6; }
  .react-calendar-heatmap .time-scale-4 { fill: #2196f3; }
  .react-calendar-heatmap .time-scale-5 { fill: #1976d2; }
  .react-calendar-heatmap .time-scale-6 { fill: #7b1fa2; }
  .react-calendar-heatmap .time-scale-7 { fill: #9c27b0; }
  .react-calendar-heatmap .time-scale-8 { fill: #673ab7; }
  
  /* Calendar container styling - larger container, smaller squares */
  .team-heatmap-container {
    height: 180px;
    overflow: visible;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-radius: 4px;
  }
  .team-heatmap-container .react-calendar-heatmap {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }
  .team-heatmap-container .react-calendar-heatmap svg {
    width: 100% !important;
    height: 140px !important;
  }
  .team-heatmap-container .react-calendar-heatmap rect {
    stroke-width: 1px;
    rx: 1;
    ry: 1;
  }
  /* Make the actual squares smaller */
  .team-heatmap-container .react-calendar-heatmap rect {
    width: 8px !important;
    height: 8px !important;
  }
  /* Adjust spacing between squares */
  .team-heatmap-container .react-calendar-heatmap g g {
    transform: scale(0.6);
    transform-origin: 0 0;
  }
`;

const TeamCalendarHeatmap = ({ rows, employees }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("bids"); // 'bids' or 'time'
  const [selectedEmployee, setSelectedEmployee] = useState(0); // 0 for first, 1 for second

  // Get employees
  const firstEmployee = employees[0];
  const secondEmployee = employees[1];

  // Calculate date range for current month
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  // Process heatmap data
  const heatmapData = useMemo(() => {
    if (!rows?.length || !employees?.length >= 2)
      return {
        employee1: { bids: [], time: [] },
        employee2: { bids: [], time: [] },
      };

    return processHeatmapData(rows, employees, startDate, endDate);
  }, [rows, employees, startDate, endDate]);

  // Navigate months
  const navigateMonth = (increment) => {
    setCurrentDate((prev) =>
      increment ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  // Get color class for heatmap values
  const getColorClass = (value, mode) => {
    if (!value || !value.count) return "color-empty";

    const prefix = mode === "bids" ? "bid-scale-" : "time-scale-";

    // Better scaling for intensity
    let intensity;
    if (mode === "bids") {
      // For bids, scale based on count (0-20+ bids)
      intensity = Math.min(Math.max(1, Math.ceil(value.count / 3)), 8);
    } else {
      // For time, scale based on seconds (0-300+ seconds)
      intensity = Math.min(Math.max(1, Math.ceil(value.count / 60)), 8);
    }

    return `${prefix}${intensity}`;
  };

  // Get tooltip content
  const getTooltipContent = (value) => {
    if (!value || !value.date) return null;

    const dateStr = format(new Date(value.date), "MMM dd, yyyy");

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
    <Box sx={{ mt: 4 }}>
      <style>{heatmapStyles}</style>

      <Typography variant="h6" gutterBottom>
        Team Calendar Heatmap Analysis
      </Typography>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {/* Employee Selection */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" gutterBottom>
                Employee
              </Typography>
              <ToggleButtonGroup
                value={selectedEmployee}
                exclusive
                onChange={(e, value) =>
                  value !== null && setSelectedEmployee(value)
                }
                size="small"
                fullWidth
              >
                <ToggleButton value={0}>
                  {firstEmployee?.name || "Employee 1"}
                </ToggleButton>
                <ToggleButton value={1}>
                  {secondEmployee?.name || "Employee 2"}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* View Mode Selection */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" gutterBottom>
                View Mode
              </Typography>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, value) => value !== null && setViewMode(value)}
                size="small"
                fullWidth
              >
                <ToggleButton value="bids">Bids Made</ToggleButton>
                <ToggleButton value="time">Time to Bid</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Month Navigation */}
            <Grid item xs={12} sm={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2">
                  {format(currentDate, "MMMM yyyy")}
                </Typography>
                <ButtonGroup variant="outlined" size="small">
                  <Button onClick={() => navigateMonth(false)}>◀ Prev</Button>
                  <Button onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button onClick={() => navigateMonth(true)}>Next ▶</Button>
                </ButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentEmployee?.name} -{" "}
            {viewMode === "bids" ? "Daily Bid Count" : "Average Time to Bid"}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Shift: {currentEmployee?.startHour}
            {currentEmployee?.startAmPm?.toLowerCase()} -{" "}
            {currentEmployee?.endHour}
            {currentEmployee?.endAmPm?.toLowerCase()}
          </Typography>

          <Box
            className="team-heatmap-container"
            sx={{
              // Remove hardcoded background, let it adapt to theme
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
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
            }}
          >
            <Typography variant="caption" sx={{ mr: 2 }}>
              {viewMode === "bids" ? "Fewer bids" : "Faster response"}
            </Typography>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => {
              const colors =
                viewMode === "bids"
                  ? [
                      "#ffebee",
                      "#ffcdd2",
                      "#ef5350",
                      "#f44336",
                      "#ff9800",
                      "#ffeb3b",
                      "#8bc34a",
                      "#4caf50",
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
                    mr: 0.5,
                    border: 1,
                    borderColor: "divider",
                  }}
                />
              );
            })}
            <Typography variant="caption" sx={{ ml: 2 }}>
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
