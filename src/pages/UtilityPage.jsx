import React from "react";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import useActiveThreads from "../hooks/useActiveThreads";
import ThreadsDataGrid from "../components/ThreadsDataGrid";

const UtilityPage = () => {
  const { threads, loading, error, getThreads } = useActiveThreads();

  // Split threads by award status
  const awardedThreads = threads.filter(
    (t) => t.myBid && t.myBid.award_status === "awarded"
  );
  const notAwardedThreads = threads.filter(
    (t) => !t.myBid || t.myBid.award_status !== "awarded"
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Utility Page
      </Typography>
      <Typography sx={{ mb: 2 }}>Test utilities and API calls here.</Typography>
      <Button variant="contained" onClick={getThreads} disabled={loading}>
        Fetch Active Threads with Project & Owner Info
      </Button>
      {loading && <CircularProgress sx={{ ml: 2 }} size={24} />}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {awardedThreads.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Awarded Projects
          </Typography>
          <ThreadsDataGrid threads={awardedThreads} loading={loading} />
        </Box>
      )}
      {notAwardedThreads.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Not Awarded Projects
          </Typography>
          <ThreadsDataGrid threads={notAwardedThreads} loading={loading} />
        </Box>
      )}
    </Box>
  );
};

export default UtilityPage;
