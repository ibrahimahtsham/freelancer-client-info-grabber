import { Box, Typography, Grid } from "@mui/material";
import MilestoneCard from "./MilestoneCard";

const MilestoneSection = ({ projectTitle, milestonePayments }) => {
  return (
    <Box
      sx={{
        margin: 2,
        backgroundColor: (theme) => theme.palette.background.default,
        borderRadius: 1,
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom component="div">
        Milestone Payments - {projectTitle}
      </Typography>

      <Grid container spacing={2}>
        {milestonePayments && milestonePayments.length > 0 ? (
          milestonePayments.map((payment, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <MilestoneCard payment={payment} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              No milestone payments found for this bid.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MilestoneSection;
