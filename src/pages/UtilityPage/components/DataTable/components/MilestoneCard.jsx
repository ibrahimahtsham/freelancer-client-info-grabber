import { Box, Typography, Chip, alpha } from "@mui/material";
import { formatDate } from "../../../../../utils/dateUtils";

const MilestoneCard = ({ payment }) => {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
        mb: 1,
        bgcolor: (theme) =>
          payment.status === "cleared"
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(theme.palette.grey[500], 0.1),
        boxShadow: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: "bold",
          color: "success.dark",
        }}
      >
        ${parseFloat(payment.amount).toFixed(2)}
      </Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={1}
      >
        <Typography variant="body2">
          {payment.formatted_date || formatDate(new Date(payment.date * 1000))}
        </Typography>
        <Chip
          size="small"
          label={payment.status}
          color={payment.status === "cleared" ? "success" : "default"}
        />
      </Box>

      {payment.reason && (
        <Typography
          variant="body2"
          color="text.secondary"
          mt={1}
          sx={{
            p: 1,
            borderLeft: "3px solid",
            borderColor: "divider",
            backgroundColor: alpha("#f5f5f5", 0.5),
            borderRadius: "0 4px 4px 0",
          }}
        >
          {payment.reason}
        </Typography>
      )}
    </Box>
  );
};

export default MilestoneCard;
