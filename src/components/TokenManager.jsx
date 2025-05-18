import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  TextField,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { getStoredToken, saveToken, clearToken } from "../utils/tokenHelper";

const TokenManager = () => {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  const handleOpen = () => {
    setToken(getStoredToken() || "");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setShowToken(false);
  };

  const handleSave = () => {
    saveToken(token);
    handleClose();
    window.location.reload();
  };

  const handleClear = () => {
    clearToken();
    setToken("");
    handleClose();
    window.location.reload();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} title="API Settings">
        <SettingsIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>API Token Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your API token is used to access the Freelancer.com API. You can
            update or clear it here.
          </Typography>

          <TextField
            label="API Token"
            type={showToken ? "text" : "password"}
            fullWidth
            value={token}
            onChange={(e) => setToken(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button size="small" onClick={() => setShowToken(!showToken)}>
            {showToken ? "Hide Token" : "Show Token"}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClear} color="error">
            Clear Token
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TokenManager;
