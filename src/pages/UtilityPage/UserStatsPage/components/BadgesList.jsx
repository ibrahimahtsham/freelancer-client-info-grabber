import { Box, Typography, Grid, Avatar, Tooltip } from "@mui/material";

const BadgesList = ({ badges }) => {
  if (!badges || badges.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Badges & Achievements
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No badges earned yet
        </Typography>
      </Box>
    );
  }

  // Sort badges by award date (newest first)
  const sortedBadges = [...badges].sort(
    (a, b) => b.time_awarded - a.time_awarded
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Badges & Achievements ({badges.length})
      </Typography>

      <Grid container spacing={2}>
        {sortedBadges.map((badge) => {
          const awardDate = new Date(badge.time_awarded);

          return (
            <Grid
              item
              key={`${badge.id}-${badge.time_awarded}`}
              xs={4}
              sm={3}
              md={4}
            >
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2">{badge.name}</Typography>
                    <Typography variant="body2">{badge.description}</Typography>
                    <Typography variant="caption">
                      Awarded: {awardDate.toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    },
                  }}
                >
                  <Avatar
                    src={`https://www.freelancer.com${badge.icon_url}`}
                    alt={badge.name}
                    sx={{ width: 48, height: 48, mb: 1 }}
                  />
                  <Typography
                    variant="caption"
                    align="center"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {badge.name}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default BadgesList;
