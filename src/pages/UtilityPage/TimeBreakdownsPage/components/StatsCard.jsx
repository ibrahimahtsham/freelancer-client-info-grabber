import { Box, Paper, Typography } from "@mui/material";

/**
 * Reusable card for displaying individual stats
 */
const StatsCard = ({
  title,
  value,
  total,
  prefix = "",
  suffix = "",
  color,
}) => (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      borderLeft: `4px solid ${color}`,
    }}
  >
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h5" component="div" fontWeight="bold">
      {prefix}
      {value}
      {suffix}
    </Typography>
    {total && (
      <Typography variant="body2" color="text.secondary">
        out of {total} total
      </Typography>
    )}
  </Paper>
);

export default StatsCard;
