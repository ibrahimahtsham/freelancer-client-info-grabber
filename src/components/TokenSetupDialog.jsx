import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Link,
} from "@mui/material";
import { saveToken } from "../utils/tokenHelper";

const TokenSetupDialog = ({ open, onClose }) => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [testingToken, setTestingToken] = useState(false);

  // Handle form submission
  const handleSubmit = async () => {
    if (!token.trim()) {
      setError("Please enter a valid API token");
      return;
    }

    setTestingToken(true);
    setError("");

    try {
      // Test token validity by making a simple API call
      const response = await fetch(
        "https://www.freelancer.com/api/users/0.1/self/",
        {
          headers: {
            "freelancer-oauth-v1": token,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data?.result?.id) {
        // Token is valid - save it
        saveToken(token);
        onClose(true); // Close with success indicator
      } else {
        setError("Invalid token. Please check your token and try again.");
      }
    } catch (err) {
      setError(`Error testing token: ${err.message}`);
    } finally {
      setTestingToken(false);
    }
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="token-setup-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="token-setup-dialog-title">API Token Setup</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To use this application, you need to provide your Freelancer.com API
          token. Your token will be stored in your browser's cookies and will be
          used for all API calls.
        </DialogContentText>

        <Box sx={{ my: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">
              You can generate a token in your{" "}
              <Link
                href="https://www.freelancer.com/users/settings/api"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freelancer.com API settings
              </Link>
            </Typography>
          </Alert>
        </Box>

        <TextField
          autoFocus
          margin="dense"
          label="API Token"
          type="text"
          fullWidth
          variant="outlined"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={testingToken || !token.trim()}
        >
          {testingToken ? "Validating..." : "Save Token"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TokenSetupDialog;
