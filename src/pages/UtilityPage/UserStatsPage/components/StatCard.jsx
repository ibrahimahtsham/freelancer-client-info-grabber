import { Box, Paper, Typography, Icon } from "@mui/material";

const StatCard = ({
  title,
  value,
  icon,
  valuePrefix = "",
  valueSuffix = "",
  isText = false,
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {icon && (
        <Icon sx={{ fontSize: 40, mb: 1, color: "primary.main" }}>{icon}</Icon>
      )}
      <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
        {valuePrefix}
        {isText ? value : value?.toLocaleString() || "0"}
        {valueSuffix}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        {title}
      </Typography>
    </Paper>
  );
};

export default StatCard;
