import React from "react";
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
} from "@mui/material";
import PieChart from "@mui/icons-material/PieChart";

const SkillsStatsChart = ({ topSkillsWithCounts }) => {
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

  // Get top skills (max 8)
  const topSkills = topSkillsWithCounts.slice(0, 8);

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

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <PieChart color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Skills Distribution</Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Top Skills by Project Count
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          {topSkills.map((skill, index) => (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2">{skill.name}</Typography>
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
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="subtitle2" gutterBottom>
            Projects by Category
          </Typography>

          <List dense>
            {Object.entries(categories)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
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

          {Object.keys(categories).length > 5 && (
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

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Based on {totalJobsCount} completed projects
        </Typography>
      </Box>
    </Paper>
  );
};

export default SkillsStatsChart;
