import {
  Card,
  CardContent,
  Typography,
  Box,
  Slider,
  Switch,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";

const BonusPanel = ({
  attendanceBonus,
  setAttendanceBonus,
  perfectAttendance,
  setPerfectAttendance,
  qualityBonus,
  setQualityBonus,
  resetToDefaults,
  usdToPkrRate,
}) => {
  return (
    <Card
      sx={{ mb: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      <CardContent>
        <Accordion elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "rgba(25, 118, 210, 0.04)",
              borderRadius: 1,
            }}
          >
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EmojiEventsIcon fontSize="small" />
              Performance Bonuses
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            <Box
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: perfectAttendance
                  ? "rgba(76, 175, 80, 0.08)"
                  : "transparent",
                p: 1.5,
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <CheckCircleIcon
                    fontSize="small"
                    sx={{
                      mr: 1,
                      color: perfectAttendance
                        ? "success.main"
                        : "text.disabled",
                    }}
                  />
                  <Typography
                    sx={{ fontWeight: perfectAttendance ? 500 : 400 }}
                  >
                    Perfect Attendance
                  </Typography>
                  <Tooltip title="Bonus for 100% attendance">
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", ml: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    ${attendanceBonus} USD (≈{" "}
                    {Math.round(attendanceBonus * usdToPkrRate)} PKR)
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={perfectAttendance}
                onChange={(e) => setPerfectAttendance(e.target.checked)}
                color="success"
              />
            </Box>

            <Box sx={{ mb: 3, px: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  Attendance Bonus Amount
                </Typography>
                <Chip
                  label={`$${attendanceBonus}`}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Slider
                value={attendanceBonus}
                onChange={(e, newValue) => setAttendanceBonus(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={30}
                step={1}
                marks={[
                  { value: 0, label: "$0" },
                  { value: 15, label: "$15" },
                  { value: 30, label: "$30" },
                ]}
              />
            </Box>

            <Box sx={{ mb: 3, px: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <StarIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "warning.main" }}
                />
                <Typography variant="body2" fontWeight={500}>
                  Quality of Bid Bonus
                </Typography>
                <Chip
                  label={`$${qualityBonus}`}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Slider
                value={qualityBonus}
                onChange={(e, newValue) => setQualityBonus(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={30}
                step={1}
                marks={[
                  { value: 0, label: "$0" },
                  { value: 15, label: "$15" },
                  { value: 30, label: "$30" },
                ]}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1, textAlign: "right" }}
              >
                ~{Math.round(qualityBonus * usdToPkrRate)} PKR
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button
            variant="outlined"
            onClick={resetToDefaults}
            fullWidth
            size="medium"
            startIcon={<RestartAltIcon />}
            sx={{ borderRadius: 2 }}
          >
            Reset to Default Values
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BonusPanel;
