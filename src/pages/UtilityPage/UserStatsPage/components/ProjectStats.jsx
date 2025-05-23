import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Stack,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import PendingIcon from "@mui/icons-material/Pending";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const CircularProgressWithLabel = ({
  value,
  label,
  icon,
  color = "primary",
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CircularProgress
          variant="determinate"
          value={100}
          sx={{ color: "grey.300" }}
          size={80}
          thickness={3}
        />
        <CircularProgress
          variant="determinate"
          value={value}
          color={color}
          size={80}
          thickness={3}
          sx={{
            position: "absolute",
            left: 0,
            "& circle": {
              strokeLinecap: "round",
            },
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="body1" sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Box>
  );
};

const ProjectStats = ({ stats, earnings }) => {
  if (!stats) return null;

  const {
    completed = 0,
    inProgress = 0,
    total = 0,
    onBudgetRate = 0,
    onTimeRate = 0,
  } = stats;

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Project Statistics
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {completed}
              </Typography>
              <Typography variant="body2">Completed</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {inProgress}
              </Typography>
              <Typography variant="body2">In Progress</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold">
                {total}
              </Typography>
              <Typography variant="body2">Total</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 2 }} />

      {earnings && (
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography variant="subtitle1" gutterBottom>
            Total Earnings
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AttachMoneyIcon color="success" sx={{ fontSize: 32 }} />
            <Typography variant="h4" color="success.main" fontWeight="bold">
              ${earnings}
            </Typography>
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Performance Metrics
        </Typography>

        <Stack
          direction="row"
          spacing={4}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <CircularProgressWithLabel
            value={onBudgetRate}
            label="On Budget"
            icon={<DoneIcon color="success" />}
            color="success"
          />

          <CircularProgressWithLabel
            value={onTimeRate}
            label="On Time"
            icon={<PendingIcon color="info" />}
            color="info"
          />
        </Stack>
      </Box>
    </Paper>
  );
};

export default ProjectStats;
