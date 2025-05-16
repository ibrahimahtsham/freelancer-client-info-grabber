import React from "react";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import useActiveThreads from "../hooks/useActiveThreads";

const UtilityPage = () => {
  const { threads, loading, error, getThreads } = useActiveThreads();

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
      {threads.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Active Threads:</Typography>
          {threads.map((thread) => (
            <Box
              key={thread.id}
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "#222",
                borderRadius: 1,
                color: "#fff",
              }}
            >
              <Typography>
                <strong>Thread ID:</strong> {thread.id}
              </Typography>
              <Typography>
                <strong>Owner ID:</strong> {thread.thread.owner}
              </Typography>
              <Typography>
                <strong>Project ID:</strong> {thread.thread.context?.id}
              </Typography>
              <Typography>
                <strong>Context Type:</strong> {thread.thread.context?.type}
              </Typography>
              <Divider sx={{ my: 1, bgcolor: "#444" }} />
              <Typography>
                <strong>Project Title:</strong>{" "}
                {thread.projectInfo?.title || "N/A"}
              </Typography>
              <Typography>
                <strong>Project Description:</strong>{" "}
                {thread.projectInfo?.description || "N/A"}
              </Typography>
              <Typography>
                <strong>Project Upload Date:</strong>{" "}
                {thread.projectUploadDate || "N/A"}
              </Typography>
              <Typography>
                <strong>First Message Date:</strong>{" "}
                {thread.firstMessageDate || "N/A"}
              </Typography>
              <Typography>
                <strong>Project Bid Price:</strong> {thread.bidPrice || "N/A"}
              </Typography>
              <Typography>
                <strong>Project Link:</strong>{" "}
                {thread.projectLink ? (
                  <a
                    href={thread.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#90caf9" }}
                  >
                    {thread.projectLink}
                  </a>
                ) : (
                  "N/A"
                )}
              </Typography>
              <Divider sx={{ my: 1, bgcolor: "#444" }} />
              <Typography>
                <strong>Owner Name:</strong>{" "}
                {thread.ownerInfo?.public_name ||
                  thread.ownerInfo?.username ||
                  "N/A"}
              </Typography>
              <Typography>
                <strong>Owner Location:</strong>{" "}
                {thread.ownerInfo?.location?.city || "N/A"},{" "}
                {thread.ownerInfo?.location?.country?.name || ""}
              </Typography>
              <Typography>
                <strong>Client Profile:</strong>{" "}
                {thread.clientProfileLink ? (
                  <a
                    href={thread.clientProfileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#90caf9" }}
                  >
                    {thread.clientProfileLink}
                  </a>
                ) : (
                  "N/A"
                )}
              </Typography>
              <Typography>
                <strong>Your Bid Amount:</strong>{" "}
                {thread.myBid ? `$${thread.myBid.amount}` : "N/A"}
              </Typography>
              <Typography>
                <strong>Total Paid (Milestones):</strong>{" "}
                {thread.totalPaid !== undefined
                  ? `$${thread.totalPaid}`
                  : "N/A"}
              </Typography>
              <Typography>
                <strong>Award Status:</strong>{" "}
                {thread.myBid?.award_status || "N/A"}
              </Typography>
              {thread.error && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {thread.error}
                </Alert>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UtilityPage;
