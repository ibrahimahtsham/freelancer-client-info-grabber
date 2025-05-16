import React, { useState } from "react";
import { TextField, Button, Typography, Link, Box } from "@mui/material";
import { fetchClientInfo } from "../utils/api/client";
import { formatEpochToPakistanTime } from "../utils/dateUtils";

const ClientInfoForm = ({ projectId, setProjectId, onFetched }) => {
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchClientInfo = async () => {
    if (!projectId) {
      alert("Please enter a project ID.");
      return;
    }

    setLoading(true);
    setError("");
    setClientInfo(null);

    try {
      const data = await fetchClientInfo(projectId);
      setClientInfo(data);
      if (onFetched) onFetched(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const client = clientInfo?.client;
  const project = clientInfo?.project;
  const clientName = client?.public_name || client?.username;
  const clientProfileUrl = client?.username
    ? `https://www.freelancer.com/u/${client.username}`
    : "#";
  const readableTime = project?.submitdate
    ? formatEpochToPakistanTime(project.submitdate)
    : "";

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🔍 Get Client Info by Project ID
      </Typography>
      <TextField
        label="Enter Project ID"
        variant="outlined"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleFetchClientInfo}
        disabled={loading}
        sx={{ mt: 1 }}
      >
        {loading ? "Fetching..." : "Get Client Info"}
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {clientInfo && (
        <Box mt={2} textAlign="left">
          <Typography variant="subtitle1">
            👤 Client Name:{" "}
            <Link
              href={clientProfileUrl}
              target="_blank"
              rel="noopener"
              underline="hover"
              color="primary"
            >
              {clientName}
            </Link>
          </Typography>
          <Typography variant="subtitle1">
            🕒 Project Submitted: {readableTime}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ClientInfoForm;
