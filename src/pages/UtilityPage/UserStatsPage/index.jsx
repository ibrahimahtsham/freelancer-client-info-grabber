import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { fetchUserDetails, resetCachedUserData } from "./apis/fetchUserDetails";
import { processUserStats } from "./utils/statsProcessing";

// Components
import ProfileSummary from "./components/ProfileSummary";
import ProfileDescription from "./components/ProfileDescription";
import ReputationDisplay from "./components/ReputationDisplay";
import SkillsDisplay from "./components/SkillsDisplay";
import ProjectStats from "./components/ProjectStats";
import LoginInfo from "./components/LoginInfo";
import HistoryTimeline from "./components/HistoryTimeline";
import SkillsStatsChart from "./components/SkillsStatsChart";

// Silent logger that doesn't use console.log
const silentLogger = () => {};

const UserStatsPage = () => {
  const [processedStats, setProcessedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use silent logger instead of console.log
        const userData = await fetchUserDetails(silentLogger);

        // Process the user stats
        const stats = processUserStats(userData);
        setProcessedStats(stats);
      } catch {
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Clean up function to reset cache when component unmounts
    return () => resetCachedUserData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading user data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!processedStats) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">No user data available.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ProfileSummary userDetails={processedStats} />
          </Grid>
          <Grid item xs={12} md={8}>
            <ProfileDescription
              description={processedStats.profileDescription}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ width: "100%", mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="user data tabs"
        >
          <Tab label="Reputation & Stats" />
          <Tab label="Skill Distribution" />
          <Tab label="Skills & Qualifications" />
          <Tab label="Login History" />
          <Tab label="Project History" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ReputationDisplay reputation={processedStats.reputation} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ProjectStats
                stats={processedStats.projectStats}
                earnings={processedStats.totalEarnings}
              />
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <SkillsStatsChart
            topSkillsWithCounts={processedStats.topSkillsWithCounts}
            skillsByCategory={processedStats.skillsByCategory}
          />
        )}

        {tabValue === 2 && (
          <SkillsDisplay
            skills={processedStats.skills}
            qualifications={processedStats.qualifications}
            badges={processedStats.badges}
          />
        )}

        {tabValue === 3 && <LoginInfo loginInfo={processedStats.loginInfo} />}

        {tabValue === 4 && (
          <HistoryTimeline registrationDate={processedStats.registrationDate} />
        )}
      </Box>
    </Container>
  );
};

export default UserStatsPage;
