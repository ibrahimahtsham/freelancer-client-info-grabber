import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
  Api as ApiIcon,
  Timer,
} from "@mui/icons-material";

const CategoryIcon = ({ status }) => {
  switch (status) {
    case "completed":
      return <CheckCircle color="success" />;
    case "in-progress":
      return <Schedule color="primary" />;
    default:
      return <RadioButtonUnchecked color="disabled" />;
  }
};

const formatDuration = (duration) => {
  if (!duration) return "0s";

  const totalSeconds = Math.floor(duration / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.slice(0, 2).join(" "); // Show max 2 units for readability
};

const formatETA = (eta) => {
  if (!eta || !eta.remainingTimeMs) return null;

  const totalSeconds = Math.floor(eta.remainingTimeMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  const timeString = parts.slice(0, 2).join(" "); // Show max 2 units
  return `${timeString} remaining`;
};

const categoryDisplayNames = {
  user_id: "User ID Lookup",
  bids: "Bid Data Fetch",
  projects: "Project Details",
  threads: "Thread Information", // This is the bottleneck!
  payments: "Payment Details",
  clients: "Client Profiles",
  processing: "Data Processing",
};

const DetailedProgressDisplay = ({ progressData, visible = false }) => {
  if (!visible) return null;

  const { overall, currentCategory, categories, eta, elapsedTime } =
    progressData;
  const categoryList = Object.entries(categories);
  const completedCategories = categoryList.filter(
    ([, data]) => data.status === "completed"
  );
  const totalDuration = completedCategories.reduce(
    (sum, [, data]) => sum + (data.duration || 0),
    0
  );

  return (
    <Card sx={{ mt: 2, mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Detailed Progress Tracking</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={`${Math.round(overall)}% Complete`}
              color={overall === 100 ? "success" : "primary"}
              variant="outlined"
            />
            {eta && (
              <Chip
                icon={<Timer />}
                label={formatETA(eta)}
                color="info"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>

        {/* Overall Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Elapsed: {formatDuration(elapsedTime)} | Total:{" "}
              {formatDuration(totalDuration)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overall}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {/* Current Category */}
        {currentCategory && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<ApiIcon />}
              label={`Currently: ${
                categoryDisplayNames[currentCategory] || currentCategory
              }`}
              color="primary"
              size="small"
            />
          </Box>
        )}

        {/* Category Details */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              API Categories
            </Typography>
            <List dense>
              {Object.entries(categoryDisplayNames).map(
                ([key, displayName]) => {
                  const categoryData = categories[key];
                  const isActive = currentCategory === key;

                  return (
                    <ListItem key={key} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CategoryIcon status={categoryData?.status} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isActive ? "bold" : "normal",
                                color: isActive ? "primary.main" : "inherit",
                              }}
                            >
                              {displayName}
                              {key === "threads" && " ⚠️"}{" "}
                              {/* Warning for bottleneck */}
                            </Typography>
                            {categoryData?.duration ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDuration(categoryData.duration)}
                              </Typography>
                            ) : categoryData?.estimated ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                ~{formatDuration(categoryData.estimated)}
                              </Typography>
                            ) : null}
                          </Box>
                        }
                        secondary={
                          <>
                            {categoryData?.message && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {categoryData.message}
                              </Typography>
                            )}
                            {categoryData?.status === "in-progress" &&
                              categoryData?.progress > 0 && (
                                <LinearProgress
                                  variant="determinate"
                                  value={categoryData.progress}
                                  sx={{ mt: 0.5, height: 4 }}
                                />
                              )}
                          </>
                        }
                      />
                    </ListItem>
                  );
                }
              )}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Performance Stats
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
              }}
            >
              {completedCategories.length > 0 ? (
                <>
                  {completedCategories.map(([name, data]) => (
                    <Box
                      key={name}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption">
                        {categoryDisplayNames[name] || name}:
                      </Typography>
                      <Typography
                        variant="caption"
                        color={name === "threads" ? "warning.main" : "primary"}
                      >
                        {formatDuration(data.duration)}
                      </Typography>
                    </Box>
                  ))}

                  {/* Performance insights */}
                  <Box
                    sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: "divider" }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      💡 Thread fetching takes ~65% of total time
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No completed categories yet
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DetailedProgressDisplay;
