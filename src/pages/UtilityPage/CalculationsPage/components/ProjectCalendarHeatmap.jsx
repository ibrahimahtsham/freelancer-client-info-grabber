import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  ButtonGroup,
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
  isAfter,
} from "date-fns";

const ProjectCalendarHeatmap = ({ rows }) => {
  const [tab, setTab] = useState(0);
  const [heatmapData, setHeatmapData] = useState([]);
  const [startDate, setStartDate] = useState(
    subMonths(startOfMonth(new Date()), 5)
  );
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));

  // Add date range navigation functions
  const goBackward = () => {
    setStartDate((prevStart) => subMonths(prevStart, 3));
    setEndDate((prevEnd) => subMonths(prevEnd, 3));
  };

  const goForward = () => {
    // Don't go beyond current month
    const newEndDate = addMonths(endDate, 3);
    const today = new Date();

    if (isAfter(newEndDate, today)) {
      setEndDate(endOfMonth(today));
      setStartDate(subMonths(endOfMonth(today), 5));
    } else {
      setStartDate(addMonths(startDate, 3));
      setEndDate(newEndDate);
    }
  };

  const resetDateRange = () => {
    setStartDate(subMonths(startOfMonth(new Date()), 5));
    setEndDate(endOfMonth(new Date()));
  };

  useEffect(() => {
    if (!rows?.length) return;

    // Process data based on selected tab
    const processData = () => {
      const dataMap = {};

      rows.forEach((row) => {
        if (!row.bid_time) return;

        const date = new Date(row.bid_time * 1000);
        const dateStr = format(date, "yyyy-MM-dd");

        if (!dataMap[dateStr]) {
          dataMap[dateStr] = {
            bids: 0,
            awarded: 0,
            responses: 0,
          };
        }

        dataMap[dateStr].bids++;

        if (row.award_status === "awarded") {
          dataMap[dateStr].awarded++;
        }

        if (row.received_response) {
          dataMap[dateStr].responses++;
        }
      });

      // Convert to array format needed for heatmap
      const heatmapValues = Object.entries(dataMap).map(([date, data]) => {
        return {
          date,
          count:
            tab === 0 ? data.bids : tab === 1 ? data.responses : data.awarded,
          totalBids: data.bids,
          totalResponses: data.responses,
          totalAwarded: data.awarded,
        };
      });

      setHeatmapData(heatmapValues);
    };

    processData();
  }, [rows, tab, startDate, endDate]);

  const getClassForValue = (value) => {
    if (!value || value.count === 0) {
      return "color-empty";
    }

    const intensity = Math.min(Math.floor(value.count / 2) + 1, 4);
    return `color-scale-${intensity}`;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Project Activity Calendar
      </Typography>

      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Tabs
              value={tab}
              onChange={(e, newValue) => setTab(newValue)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ flexGrow: 1 }}
            >
              <Tab label="Bids" />
              <Tab label="Responses" />
              <Tab label="Awarded" />
            </Tabs>

            <Box>
              <Typography variant="caption" sx={{ mr: 1 }}>
                {format(startDate, "MMM yyyy")} - {format(endDate, "MMM yyyy")}
              </Typography>
              <ButtonGroup size="small">
                <Button onClick={goBackward}>◀ Earlier</Button>
                <Button onClick={resetDateRange}>Reset</Button>
                <Button onClick={goForward}>Later ▶</Button>
              </ButtonGroup>
            </Box>
          </Box>

          <Box
            sx={{
              ".color-scale-1": { fill: "#d6e685" },
              ".color-scale-2": { fill: "#8cc665" },
              ".color-scale-3": { fill: "#44a340" },
              ".color-scale-4": { fill: "#1e6823" },
              ".color-empty": { fill: "#ebedf0" },
              ".react-calendar-heatmap text": { fontSize: "7px" },
            }}
          >
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={heatmapData}
              classForValue={getClassForValue}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return null;
                return {
                  "data-tooltip-id": "calendar-tooltip",
                  "data-tooltip-content": `Date: ${format(
                    new Date(value.date),
                    "MMM dd, yyyy"
                  )}\nBids: ${value.totalBids}\nResponses: ${
                    value.totalResponses
                  }\nAwarded: ${value.totalAwarded}`,
                };
              }}
            />

            {/* Updated ReactTooltip usage for v5+ */}
            <ReactTooltip
              id="calendar-tooltip"
              place="top"
              style={{ whiteSpace: "pre-line" }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#ebedf0",
                  mr: 1,
                  borderRadius: 1,
                }}
              ></Box>
              <Typography variant="caption">No projects</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#d6e685",
                  mr: 1,
                  borderRadius: 1,
                }}
              ></Box>
              <Typography variant="caption">1-2 projects</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#44a340",
                  mr: 1,
                  borderRadius: 1,
                }}
              ></Box>
              <Typography variant="caption">3-5 projects</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#1e6823",
                  mr: 1,
                  borderRadius: 1,
                }}
              ></Box>
              <Typography variant="caption">5+ projects</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectCalendarHeatmap;
