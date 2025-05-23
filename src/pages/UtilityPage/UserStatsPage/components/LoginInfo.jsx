import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid,
} from "@mui/material";
import LaptopIcon from "@mui/icons-material/Laptop";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TabletIcon from "@mui/icons-material/Tablet";
import PublicIcon from "@mui/icons-material/Public";
import { formatDate } from "../utils/statsProcessing";

const LoginInfo = ({ loginInfo }) => {
  if (!loginInfo?.devices || loginInfo.devices.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Login Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No login history available
        </Typography>
      </Paper>
    );
  }

  // Sort devices by last_login (most recent first)
  const sortedDevices = [...loginInfo.devices].sort(
    (a, b) => b.last_login - a.last_login
  );
  const mostRecentDevice = sortedDevices[0];

  // Determine device icon
  const getDeviceIcon = (device) => {
    const deviceType = (device.device_type || "").toLowerCase();
    if (deviceType.includes("mobile") || deviceType.includes("phone")) {
      return <SmartphoneIcon />;
    } else if (deviceType.includes("tablet")) {
      return <TabletIcon />;
    } else {
      return <LaptopIcon />;
    }
  };

  // Group devices by IP address
  const devicesByIp = sortedDevices.reduce((acc, device) => {
    const ip = device.ip_address || "Unknown";
    if (!acc[ip]) {
      acc[ip] = [];
    }
    acc[ip].push(device);
    return acc;
  }, {});

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Login Information
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Most Recent Login
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: "background.default", p: 2, borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Time:</strong>{" "}
                {formatDate(new Date(mostRecentDevice.last_login * 1000))}
              </Typography>
              <Typography variant="body2">
                <strong>IP Address:</strong>{" "}
                {mostRecentDevice.ip_address || "Unknown"}
              </Typography>
              <Typography variant="body2">
                <strong>Device:</strong>{" "}
                {mostRecentDevice.device_type || "Unknown"}
              </Typography>
              <Typography variant="body2">
                <strong>Browser:</strong>{" "}
                {mostRecentDevice.browser_name || "Unknown"}{" "}
                {mostRecentDevice.browser_version || ""}
              </Typography>
              <Typography variant="body2">
                <strong>OS:</strong> {mostRecentDevice.os_name || "Unknown"}{" "}
                {mostRecentDevice.os_version || ""}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Login History
      </Typography>

      {Object.entries(devicesByIp).map(([ip, devices]) => (
        <Box key={ip} sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PublicIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="subtitle2">IP Address: {ip}</Typography>
            <Chip
              label={`${devices.length} login${devices.length > 1 ? "s" : ""}`}
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>

          <List dense>
            {devices.map((device, index) => (
              <ListItem
                key={`${ip}-${index}`}
                divider={index !== devices.length - 1}
              >
                <ListItemIcon>{getDeviceIcon(device)}</ListItemIcon>
                <ListItemText
                  primary={`${device.browser_name || "Unknown"} on ${
                    device.os_name || "Unknown"
                  } ${device.os_version || ""}`}
                  secondary={formatDate(new Date(device.last_login * 1000))}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Paper>
  );
};

export default LoginInfo;
