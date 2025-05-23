import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, Legend);

const SkillsStatsChart = ({ topSkillsWithCounts }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Check if we have skill data to display
  const hasSkillData = topSkillsWithCounts && topSkillsWithCounts.length > 0;

  if (!hasSkillData) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Skills Distribution
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", my: 4 }}
        >
          No skills distribution data available for this user.
        </Typography>
      </Paper>
    );
  }

  // Get top skills based on expanded state
  const displayCount = expanded ? topSkillsWithCounts.length : 8;
  const topSkills = topSkillsWithCounts.slice(0, displayCount);

  // Calculate total for percentage
  const totalJobsCount = topSkillsWithCounts.reduce(
    (sum, skill) => sum + skill.count,
    0
  );

  // Get categories with job counts
  const categories = {};
  topSkillsWithCounts.forEach((skill) => {
    const category = skill.category;
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category] += skill.count;
  });

  // Calculate additional statistics
  const avgProjectsPerSkill = totalJobsCount / topSkillsWithCounts.length;
  const avgProjectsPerCategory =
    totalJobsCount / Object.keys(categories).length;
  const topCategory = Object.entries(categories).sort(
    ([, a], [, b]) => b - a
  )[0];
  const diversityScore = Math.min(
    10,
    (Object.keys(categories).length / topSkillsWithCounts.length) * 10
  ).toFixed(1);

  // Prepare pie chart data for skills
  const skillsPieChartData = {
    labels: topSkills.slice(0, 8).map((skill) => skill.name),
    datasets: [
      {
        data: topSkills.slice(0, 8).map((skill) => skill.count),
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF5722",
          "#9C27B0",
          "#3F51B5",
          "#F44336",
          "#FFEB3B",
          "#FF9800",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare pie chart data for categories
  const categoriesPieChartData = {
    labels: Object.keys(categories).slice(0, 8),
    datasets: [
      {
        data: Object.values(categories).slice(0, 8),
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF5722",
          "#9C27B0",
          "#3F51B5",
          "#F44336",
          "#FFEB3B",
          "#FF9800",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 15,
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PieChartIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Skills Distribution</Typography>
        </Box>
        <Tooltip title="View analysis methodology">
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="overline" color="text.secondary">
                Total Skills
              </Typography>
              <Typography variant="h6">{topSkillsWithCounts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="overline" color="text.secondary">
                Categories
              </Typography>
              <Typography variant="h6">
                {Object.keys(categories).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="overline" color="text.secondary">
                Top Category
              </Typography>
              <Typography variant="h6" noWrap>
                {topCategory?.[0] || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Tooltip title="Higher score indicates more diverse skill set">
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Diversity Score
                  </Typography>
                  <Typography variant="h6">{diversityScore}/10</Typography>
                </Box>
              </Tooltip>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
        variant="fullWidth"
      >
        <Tab
          icon={<BarChartIcon fontSize="small" />}
          label="Skills Breakdown"
        />
        <Tab
          icon={<PieChartIcon fontSize="small" />}
          label="Visual Distribution"
        />
        <Tab icon={<TimelineIcon fontSize="small" />} label="Advanced Stats" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" gutterBottom>
              Top Skills by Project Count
            </Typography>

            {topSkills.map((skill, index) => (
              <Box key={index} sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Tooltip title={`Category: ${skill.category}`}>
                    <Typography variant="body2">{skill.name}</Typography>
                  </Tooltip>
                  <Typography variant="body2">
                    {skill.count} project{skill.count !== 1 ? "s" : ""} (
                    {Math.round((skill.count / totalJobsCount) * 100)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(skill.count / topSkills[0].count) * 100}
                  color={
                    index < 3 ? "success" : index < 5 ? "primary" : "secondary"
                  }
                  sx={{ height: 8, borderRadius: 2 }}
                />
              </Box>
            ))}

            {topSkillsWithCounts.length > 8 && !expanded && (
              <Button
                size="small"
                onClick={() => setExpanded(true)}
                sx={{ mt: 1 }}
              >
                Show all {topSkillsWithCounts.length} skills
              </Button>
            )}

            {expanded && (
              <Button
                size="small"
                onClick={() => setExpanded(false)}
                sx={{ mt: 1 }}
              >
                Show less
              </Button>
            )}
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" gutterBottom>
              Projects by Category
            </Typography>

            <List dense>
              {Object.entries(categories)
                .sort(([, a], [, b]) => b - a)
                .slice(0, expanded ? Object.keys(categories).length : 5)
                .map(([category, count], index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={category}
                      secondary={`${count} project${count !== 1 ? "s" : ""}`}
                    />
                    <Chip
                      label={`${Math.round((count / totalJobsCount) * 100)}%`}
                      size="small"
                      color={index === 0 ? "primary" : "default"}
                    />
                  </ListItem>
                ))}
            </List>

            {!expanded && Object.keys(categories).length > 5 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: "center" }}
              >
                +{Object.keys(categories).length - 5} more categories
              </Typography>
            )}
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom align="center">
              Skills Distribution
            </Typography>
            <Box sx={{ height: 250 }}>
              <Pie data={skillsPieChartData} options={chartOptions} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom align="center">
              Category Distribution
            </Typography>
            <Box sx={{ height: 250 }}>
              <Pie data={categoriesPieChartData} options={chartOptions} />
            </Box>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Average Projects per Skill
                </Typography>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {avgProjectsPerSkill.toFixed(1)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Higher values indicate more focused expertise
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Average Projects per Category
                </Typography>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {avgProjectsPerCategory.toFixed(1)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Indicates depth of knowledge in specific areas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Skill Distribution Analysis
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    • <strong>Primary focus:</strong> {topSkills[0]?.name} (
                    {Math.round((topSkills[0]?.count / totalJobsCount) * 100)}%
                    of projects)
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    • <strong>Specialization:</strong>{" "}
                    {Object.keys(categories).length <= 3
                      ? "Highly specialized"
                      : Object.keys(categories).length <= 6
                      ? "Moderately diverse"
                      : "Very diverse"}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    • <strong>Top category:</strong> {topCategory?.[0]} accounts
                    for {Math.round((topCategory?.[1] / totalJobsCount) * 100)}%
                    of all projects
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    • <strong>Skill breadth:</strong>{" "}
                    {topSkillsWithCounts.length} distinct skills across{" "}
                    {Object.keys(categories).length} categories
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Based on {totalJobsCount} completed projects
        </Typography>
      </Box>
    </Paper>
  );
};

export default SkillsStatsChart;
