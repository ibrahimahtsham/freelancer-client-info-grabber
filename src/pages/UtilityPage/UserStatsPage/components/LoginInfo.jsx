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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { formatDate } from "../utils/statsProcessing";

const LoginInfo = ({ loginInfo }) => {
  // Remove console log
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

  // Parse user agent to determine device type and browser
  const parseUserAgent = (userAgent) => {
    if (!userAgent)
      return { device: "Unknown", browser: "Unknown", os: "Unknown" };

    // Extract platform info
    let device = "Desktop";
    if (userAgent.toLowerCase().includes("mobile")) {
      device = "Mobile";
    } else if (userAgent.toLowerCase().includes("tablet")) {
      device = "Tablet";
    }

    // Extract browser and OS info from user agent string
    let browser = "Unknown";
    let os = "Unknown";

    if (userAgent.includes("(")) {
      const parts = userAgent.split("(");
      if (parts.length > 1) {
        const osPart = parts[1].split(")")[0].trim();
        os = osPart;

        if (parts[1].includes(")")) {
          const browserPart = parts[1].split(")")[1].trim();
          if (browserPart) {
            browser = browserPart;
          } else if (osPart.includes("Chrome")) {
            // Handle case where Chrome version is in OS part
            browser = osPart.match(/Chrome [0-9.]+/)
              ? osPart.match(/Chrome [0-9.]+/)[0]
              : "Chrome";
            os = osPart.replace(/Chrome [0-9.]+/, "").trim();
          }
        }
      }
    } else {
      browser = userAgent;
    }

    return { device, browser, os };
  };

  // Determine device icon based on user agent
  const getDeviceIcon = (device) => {
    const userAgent = (device.user_agent || "").toLowerCase();
    if (userAgent.includes("mobile") || userAgent.includes("phone")) {
      return <SmartphoneIcon />;
    } else if (userAgent.includes("tablet")) {
      return <TabletIcon />;
    } else {
      return <LaptopIcon />;
    }
  };

  // Group devices by location (city and country)
  const devicesByLocation = sortedDevices.reduce((acc, device) => {
    const location = `${device.city || "Unknown"}, ${
      device.country || "Unknown"
    }`;
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(device);
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
                <strong>Location:</strong>{" "}
                {`${mostRecentDevice.city || "Unknown"}, ${
                  mostRecentDevice.country || "Unknown"
                }`}
              </Typography>
              <Typography variant="body2">
                <strong>Device:</strong>{" "}
                {mostRecentDevice.platform || "Unknown"}
              </Typography>
              <Typography variant="body2">
                <strong>User Agent:</strong>{" "}
                {mostRecentDevice.user_agent || "Unknown"}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong>{" "}
                {mostRecentDevice.is_active ? "Active" : "Inactive"}
                {mostRecentDevice.is_current ? " (Current)" : ""}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Login History by Location
      </Typography>

      {Object.entries(devicesByLocation).map(([location, devices]) => (
        <Box key={location} sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <LocationOnIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="subtitle2">Location: {location}</Typography>
            <Chip
              label={`${devices.length} login${devices.length > 1 ? "s" : ""}`}
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>

          <List dense>
            {devices.map((device, index) => {
              const { browser } = parseUserAgent(device.user_agent);
              return (
                <ListItem
                  key={`${location}-${index}`}
                  divider={index !== devices.length - 1}
                >
                  <ListItemIcon>{getDeviceIcon(device)}</ListItemIcon>
                  <ListItemText
                    primary={`${browser} on ${device.platform}`}
                    secondary={
                      <>
                        {formatDate(new Date(device.last_login * 1000))}
                        {device.is_active ? " • Active" : " • Inactive"}
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      ))}
    </Paper>
  );
};

export default LoginInfo;
