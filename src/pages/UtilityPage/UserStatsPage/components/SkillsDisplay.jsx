import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  LinearProgress,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";

const SkillsDisplay = ({ skills, qualifications, badges }) => {
  const hasSkills = skills && Object.keys(skills).length > 0;
  const hasQualifications = qualifications && qualifications.length > 0;
  const hasBadges = badges && badges.length > 0;

  // Helper function to check if a URL is absolute (starts with http:// or https://)
  const isAbsoluteUrl = (url) => {
    return url && (url.startsWith("http://") || url.startsWith("https://"));
  };

  // Helper function to get badge icon - either an image or a fallback icon
  const getBadgeIcon = (badge) => {
    if (badge.icon_url && isAbsoluteUrl(badge.icon_url)) {
      return badge.icon_url;
    }

    // If there's a URL but it's not absolute, try to construct the full URL
    // (This is a guess based on typical Freelancer CDN patterns - may need adjustment)
    if (badge.icon_url && !isAbsoluteUrl(badge.icon_url)) {
      return `https://www.freelancer.com/${badge.icon_url}`;
    }

    // No valid URL, return null to use the fallback letter avatar
    return null;
  };

  if (!hasSkills && !hasQualifications && !hasBadges) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          No skills or qualifications information available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {hasSkills && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Skills
          </Typography>

          <Grid container spacing={2}>
            {Object.entries(skills).map(([category, count]) => (
              <Grid item key={category}>
                <Chip
                  label={`${category} (${count})`}
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: count > 5 ? "bold" : "normal",
                    fontSize: count > 5 ? "0.9rem" : "0.8rem",
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {hasQualifications && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <SchoolIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Qualifications & Certifications
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {qualifications.map((qual, index) => (
              <Grid item xs={12} md={6} lg={4} key={`qual-${index}`}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {qual.name}
                    </Typography>

                    {qual.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {qual.description}
                      </Typography>
                    )}

                    {qual.score_percentage !== null && (
                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">Score</Typography>
                          <Typography variant="body2">
                            {Math.round(qual.score_percentage)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={qual.score_percentage}
                          sx={{ height: 8, borderRadius: 2, mt: 0.5 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {hasBadges && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <EmojiEventsIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6">Badges & Achievements</Typography>
          </Box>

          <Grid container spacing={2}>
            {badges.map((badge, index) => {
              const badgeIconUrl = getBadgeIcon(badge);
              return (
                <Grid item xs={12} sm={6} md={4} key={`badge-${index}`}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardHeader
                      avatar={
                        <Avatar
                          src={badgeIconUrl}
                          alt={badge.name}
                          sx={{ bgcolor: "warning.light" }}
                        >
                          {badge.name ? (
                            badge.name.charAt(0)
                          ) : (
                            <EmojiEventsIcon />
                          )}
                        </Avatar>
                      }
                      title={badge.name}
                      subheader={
                        badge.time_awarded
                          ? new Date(
                              badge.time_awarded * 1000
                            ).toLocaleDateString()
                          : ""
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {badge.description || "No description available"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default SkillsDisplay;
