import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Divider,
  Stack,
  Chip,
  Rating,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import LanguageIcon from "@mui/icons-material/Language";
import EventIcon from "@mui/icons-material/Event";
import { formatDate } from "../utils/statsProcessing";

const ProfileSummary = ({ userDetails }) => {
  if (!userDetails) return null;

  const registrationDate = userDetails.registrationDate
    ? new Date(userDetails.registrationDate)
    : null;

  return (
    <Box sx={{ textAlign: "center" }}>
      <Avatar
        src={userDetails.profileImage}
        alt={userDetails.username}
        sx={{
          width: 120,
          height: 120,
          mx: "auto",
          mb: 2,
          border: "4px solid",
          borderColor: "primary.light",
        }}
      />

      <Typography variant="h5" gutterBottom>
        {userDetails.displayName}
      </Typography>

      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        @{userDetails.username}
      </Typography>

      {userDetails.hourlyRate > 0 && (
        <Chip
          label={`$${userDetails.hourlyRate}/hr`}
          color="primary"
          sx={{ mb: 1 }}
        />
      )}

      {userDetails.reputation?.overall > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <Rating
            value={userDetails.reputation.overall * 5}
            precision={0.1}
            readOnly
            size="small"
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            (
            {userDetails.reputation.totalReviews ||
              userDetails.totalReviews ||
              0}{" "}
            reviews)
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {userDetails.location?.country && (
          <Box display="flex" alignItems="center" justifyContent="center">
            <LocationOnIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2">
              {userDetails.location.country.name}
              {userDetails.location.city && `, ${userDetails.location.city}`}
            </Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center" justifyContent="center">
          <EventIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2">
            Member since: {formatDate(registrationDate)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="center">
          <WorkIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            Role: {userDetails.role}
          </Typography>
        </Box>

        {userDetails.primary_language && (
          <Box display="flex" alignItems="center" justifyContent="center">
            <LanguageIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
              Language: {userDetails.primary_language}
            </Typography>
          </Box>
        )}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Verification Status
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
          sx={{ gap: 1 }}
        >
          {userDetails.verificationStatus?.payment && (
            <Chip label="Payment" color="success" size="small" />
          )}
          {userDetails.verificationStatus?.email && (
            <Chip label="Email" color="success" size="small" />
          )}
          {userDetails.verificationStatus?.phone && (
            <Chip label="Phone" color="success" size="small" />
          )}
          {userDetails.verificationStatus?.identity && (
            <Chip label="Identity" color="success" size="small" />
          )}
          {userDetails.verificationStatus?.profileComplete && (
            <Chip label="Profile" color="success" size="small" />
          )}
          {userDetails.profileVerified && (
            <Chip label="Verified Freelancer" color="primary" size="small" />
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default ProfileSummary;
