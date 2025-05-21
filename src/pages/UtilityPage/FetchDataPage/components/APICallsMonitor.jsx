import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Button,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";

const APICallsMonitor = ({ stats, onReset }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  if (!stats || !Object.keys(stats).length) {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Typography color="text.secondary" variant="body2">
          No API stats available yet
        </Typography>
      </Box>
    );
  }

  // Calculate percentage of rate limit used if available
  let rateLimit = null;
  if (stats.rateLimits) {
    const { limit, remaining } = stats.rateLimits;
    const used = limit - remaining;
    const percentUsed = Math.round((used / limit) * 100);

    rateLimit = {
      limit,
      remaining,
      used,
      percentUsed,
    };
  }

  // Prepare endpoints data
  const endpointsData = Object.entries(stats.endpoints || {})
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">API Usage Statistics</Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ReplayIcon />}
          onClick={onReset}
        >
          Reset Stats
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Total API Calls */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: isDarkMode
                ? "rgba(25, 118, 210, 0.12)"
                : "rgba(25, 118, 210, 0.05)",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Total API Calls
            </Typography>
            <Typography
              variant="h3"
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Across {Object.keys(stats.endpoints || {}).length} endpoints
            </Typography>
          </Paper>
        </Grid>

        {/* Rate Limits */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: !stats.rateLimited
                ? isDarkMode
                  ? "rgba(46, 125, 50, 0.12)"
                  : "rgba(46, 125, 50, 0.05)"
                : isDarkMode
                ? "rgba(211, 47, 47, 0.12)"
                : "rgba(211, 47, 47, 0.05)",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Rate Limit Status
              </Typography>
              {stats.rateLimited && (
                <Chip
                  size="small"
                  color="error"
                  label="Limited"
                  sx={{ height: 20 }}
                />
              )}
            </Box>

            {rateLimit ? (
              <>
                <Typography
                  variant="h5"
                  color={stats.rateLimited ? "error" : "success"}
                  sx={{ fontWeight: "medium" }}
                >
                  {rateLimit.remaining} / {rateLimit.limit}
                </Typography>

                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={rateLimit.percentUsed}
                    color={rateLimit.percentUsed > 80 ? "error" : "primary"}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {rateLimit.percentUsed}% used
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Rate limit information unavailable
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Endpoints List */}
        <Grid item xs={12} sm={12} md={6}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              height: "100%",
              maxHeight: 200,
              overflow: "auto",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Requests by Endpoint
            </Typography>

            {endpointsData.length > 0 ? (
              <List dense disablePadding>
                {endpointsData.map(({ endpoint, count }) => (
                  <ListItem
                    key={endpoint}
                    disablePadding
                    sx={{
                      py: 0.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Tooltip title={endpoint} placement="top">
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "85%",
                              }}
                            >
                              {endpoint.split("/").slice(-2).join("/")}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="primary"
                              sx={{ fontWeight: "medium" }}
                            >
                              {count}
                            </Typography>
                          </Box>
                        }
                      />
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No endpoint data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default APICallsMonitor;
