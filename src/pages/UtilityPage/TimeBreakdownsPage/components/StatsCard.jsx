import { Box, Paper, Typography } from "@mui/material";

const StatsCard = ({
  title,
  value,
  total,
  prefix = "",
  suffix = "",
  color = "#1976d2",
}) => {
  return (
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
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
          {prefix}
          {value}
        </Typography>
        {total && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            / {total} {suffix}
          </Typography>
        )}
        {!total && suffix && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {suffix}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default StatsCard;
