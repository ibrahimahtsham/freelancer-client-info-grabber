import { useState, useEffect } from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ff6347",
  "#4682b4",
  "#9370db",
  "#3cb371",
  "#cd5c5c",
  "#6a5acd",
];

const ClientLocationStats = ({ rows }) => {
  const [pieData, setPieData] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const theme = useTheme();

  // Get theme-aware colors
  const textColor = theme.palette.text.primary;
  const borderColor = theme.palette.divider;

  useEffect(() => {
    if (!rows?.length) return;

    // Process country data
    const countryMap = {};

    rows.forEach((row) => {
      const country = row.client_country || "Unknown";
      if (!countryMap[country]) {
        countryMap[country] = {
          total: 0,
          awarded: 0,
          bidAmount: 0,
          paidAmount: 0,
        };
      }

      countryMap[country].total++;
      countryMap[country].bidAmount += row.bid_amount || 0;

      if (row.award_status === "awarded") {
        countryMap[country].awarded++;
        countryMap[country].paidAmount += row.paid_amount || 0;
      }
    });

    // Convert to array and sort by total projects
    const locationArray = Object.entries(countryMap)
      .map(([country, stats]) => ({
        country,
        ...stats,
        awardRate:
          stats.total > 0
            ? ((stats.awarded / stats.total) * 100).toFixed(1)
            : "0",
        avgBid:
          stats.total > 0 ? (stats.bidAmount / stats.total).toFixed(2) : "0",
        avgPaid:
          stats.awarded > 0
            ? (stats.paidAmount / stats.awarded).toFixed(2)
            : "0",
      }))
      .sort((a, b) => b.total - a.total);

    // Get top locations for pie chart (showing more locations)
    const top8 = locationArray.slice(0, 8);
    setTopLocations(top8);

    // Create data for pie chart
    const topData = top8.map((loc) => ({
      name: loc.country,
      value: loc.total,
    }));

    // Add "Others" category if there are more than 8 countries
    if (locationArray.length > 8) {
      const othersCount = locationArray
        .slice(8)
        .reduce((sum, loc) => sum + loc.total, 0);

      topData.push({ name: "Others", value: othersCount });
    }

    setPieData(topData);
  }, [rows]);

  // Simplified layout with absolute positioning for maximum space utilization
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          position: "absolute",
          top: 10,
          left: 20,
          zIndex: 10,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(0,0,0,0.7)"
              : "rgba(255,255,255,0.7)",
          color: textColor,
          padding: "4px 10px",
          borderRadius: "4px",
        }}
      >
        Client Location Analysis
      </Typography>

      {/* Chart fills the entire viewport */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw", // Force full viewport width
          height: "100vh", // Force full viewport height
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius="40%"
              innerRadius="25%"
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
              labelLine={{
                stroke: theme.palette.mode === "dark" ? "#aaa" : "#666",
                strokeWidth: 2,
              }}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={theme.palette.background.default}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} projects`, "Count"]}
              contentStyle={{
                backgroundColor: "white",
                color: "black",
                borderRadius: "4px",
                padding: "10px",
                border: `1px solid ${borderColor}`,
                fontSize: "16px",
                boxShadow: theme.shadows[3],
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{
                paddingLeft: "20px",
                fontSize: "16px",
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(0,0,0,0.7)"
                    : "rgba(255,255,255,0.7)",
                borderRadius: "4px",
                padding: "12px",
                border: `1px solid ${borderColor}`,
                color: textColor,
              }}
              formatter={(value) => (
                <span style={{ fontSize: "16px", color: textColor }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Mini stats panel */}
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          bottom: 20,
          left: 20,
          padding: 2,
          maxWidth: "300px",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(30, 30, 30, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
          zIndex: 10,
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          color="textPrimary"
        >
          Top Client Locations
        </Typography>
        {topLocations.slice(0, 5).map((location) => (
          <Box
            key={location.country}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: `1px solid ${borderColor}`,
              py: 0.5,
            }}
          >
            <Typography variant="body2" color="textPrimary">
              {location.country}
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="textPrimary">
              {location.total} ({location.awarded} awarded)
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default ClientLocationStats;
