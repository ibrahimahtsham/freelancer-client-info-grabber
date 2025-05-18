import { Box, Typography, LinearProgress } from "@mui/material";

const FetchStatusDisplay = ({ error, loading, progress, progressText }) => {
  if (!error && !loading) return null;

  return (
    <>
      {error && (
        <Typography color="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading && (
        <Box sx={{ my: 3 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography sx={{ mt: 1 }}>{progressText}</Typography>
        </Box>
      )}
    </>
  );
};

export default FetchStatusDisplay;
