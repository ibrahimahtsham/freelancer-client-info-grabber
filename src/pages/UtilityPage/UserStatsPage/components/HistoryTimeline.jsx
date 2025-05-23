import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { formatDate } from "../utils/statsProcessing";

const HistoryTimeline = ({ registrationDate }) => {
  if (!registrationDate) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No history information available.
        </Typography>
      </Paper>
    );
  }

  // Calculate milestones - for now we just have registration
  const milestones = [
    {
      date: registrationDate,
      title: "Account Created",
      description: "Joined Freelancer.com",
      icon: <PersonAddIcon />,
      color: "primary",
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Account History
      </Typography>

      <Box sx={{ p: 2 }}>
        <Timeline position="alternate">
          {milestones.map((milestone, index) => (
            <TimelineItem key={index}>
              <TimelineOppositeContent color="text.secondary">
                {formatDate(milestone.date)}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={milestone.color}>
                  {milestone.icon}
                </TimelineDot>
                {index < milestones.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Typography variant="h6" component="span">
                  {milestone.title}
                </Typography>
                <Typography>{milestone.description}</Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Paper>
  );
};

export default HistoryTimeline;
