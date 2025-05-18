import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import DataTable from "../../../components/DataTable";
import TimeSelector from "./TimeSelector";

const ShiftCard = ({
  title,
  backgroundColor,
  startHour,
  startAmPm,
  endHour,
  endAmPm,
  setStartHour,
  setStartAmPm,
  setEndHour,
  setEndAmPm,
  awardedProjects,
  otherProjects,
  loading,
}) => {
  // Convert to display format
  const formatTime = (hour, ampm) => `${hour}${ampm.toLowerCase()}`;

  return (
    <Card
      sx={{
        mb: 4,
        backgroundColor,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          {title} Shift ({formatTime(startHour, startAmPm)} -{" "}
          {formatTime(endHour, endAmPm)})
        </Typography>

        <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
          <TimeSelector
            label="Start Time"
            hour={startHour}
            ampm={startAmPm}
            onHourChange={setStartHour}
            onAmPmChange={setStartAmPm}
          />
          <TimeSelector
            label="End Time"
            hour={endHour}
            ampm={endAmPm}
            onHourChange={setEndHour}
            onAmPmChange={setEndAmPm}
          />
        </Box>

        {loading ? (
          <Box sx={{ my: 4, textAlign: "center" }}>
            <CircularProgress size={30} />
            <Typography sx={{ mt: 1 }}>Processing data...</Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mt: 3, fontWeight: "bold" }}
            >
              Awarded/Accepted Projects ({awardedProjects.length})
            </Typography>
            <Paper
              elevation={2}
              sx={{ mb: 4, backgroundColor: "background.paper" }}
            >
              <DataTable rows={awardedProjects} loading={false} />
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Other Projects ({otherProjects.length})
            </Typography>
            <Paper elevation={2} sx={{ backgroundColor: "background.paper" }}>
              <DataTable rows={otherProjects} loading={false} />
            </Paper>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftCard;
