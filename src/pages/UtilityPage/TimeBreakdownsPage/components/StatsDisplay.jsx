import { Box, Typography, Paper, Grid } from "@mui/material";
import StatsCard from "./StatsCard";
import { formatShiftTime } from "../utils/formatters";
import { calculateEmployeeStats } from "../utils/statsCalculator";

/**
 * Display employee stats in a styled card layout
 */
const StatsDisplay = ({ currentEmployee, awardedProjects, otherProjects }) => {
  const { totalBidAmount, totalPaidAmount, winRate } = calculateEmployeeStats(
    awardedProjects,
    otherProjects
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        elevation={2}
        sx={{ p: 2, backgroundColor: `${currentEmployee.color}15` }}
      >
        <Typography variant="h5" gutterBottom>
          {currentEmployee.name}'s Shift: {formatShiftTime(currentEmployee)}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Projects Won"
              value={awardedProjects.length}
              total={awardedProjects.length + otherProjects.length}
              color={currentEmployee.color}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Win Rate"
              value={winRate}
              suffix="%"
              color={currentEmployee.color}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Bid Amount"
              value={totalBidAmount.toFixed(2)}
              prefix="$"
              color={currentEmployee.color}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Paid Amount"
              value={totalPaidAmount.toFixed(2)}
              prefix="$"
              color={currentEmployee.color}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StatsDisplay;
