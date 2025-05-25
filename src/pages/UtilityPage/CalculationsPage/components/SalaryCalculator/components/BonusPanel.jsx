import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  Slider,
  Button,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider, // Added Divider import
} from "@mui/material";
import {
  EmojiEvents as EmojiEventsIcon,
  ExpandMore as ExpandMoreIcon,
  RestartAlt as RestartAltIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  InfoOutlined as InfoOutlinedIcon,
  Star as StarIcon,
  AutoGraph as AutoGraphIcon,
  Diversity3 as Diversity3Icon,
  AddTask as AddTaskIcon,
} from "@mui/icons-material";

const BonusPanel = ({
  attendanceBonus,
  setAttendanceBonus,
  perfectAttendance,
  setPerfectAttendance,
  qualityBonus,
  setQualityBonus,
  resetToDefaults,
}) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <EmojiEventsIcon sx={{ mr: 1 }} fontSize="small" />
          Bonus Configuration
        </Typography>

        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="attendance-content"
            id="attendance-header"
          >
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon fontSize="small" />
              Attendance & Performance
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
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
                <Switch
                  checked={perfectAttendance}
                  onChange={(e) => setPerfectAttendance(e.target.checked)}
                  color="success"
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", ml: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  ${attendanceBonus} USD
                </Typography>
              </Box>

              <Slider
                value={attendanceBonus}
                onChange={(e, val) => setAttendanceBonus(val)}
                disabled={!perfectAttendance}
                min={5}
                max={50}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(x) => `$${x}`}
                sx={{ mt: 3 }}
                marks={[
                  { value: 5, label: "$5" },
                  { value: 17, label: "$17" },
                  { value: 50, label: "$50" },
                ]}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 1 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, display: "flex", alignItems: "center" }}
              >
                <StarIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "warning.main" }}
                />
                Quality of Bids Bonus (monthly)
                <Tooltip title="Based on review score from Business Development Lead">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Slider
                value={qualityBonus}
                onChange={(e, val) => setQualityBonus(val)}
                min={0}
                max={50}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(x) => `$${x}`}
                marks={[
                  { value: 0, label: "$0" },
                  { value: 15, label: "$15" },
                  { value: 35, label: "$35" },
                  { value: 50, label: "$50" },
                ]}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="other-bonuses-content"
            id="other-bonuses-header"
          >
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoGraphIcon fontSize="small" />
              Additional Bonuses
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Tooltip title="Calculation is automatic based on sales figures">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InfoOutlinedIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Sales Maturity Bonus: $35 for sales over $1000
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Tooltip title="Automatic after 3+ months of $2500+ sales">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InfoOutlinedIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Consistency Bonus: $85 × months (for 3+ months at $2500+)
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Tooltip title="For assisting with chat/follow-ups">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InfoOutlinedIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Lead assist: 0.5% of project total (requires tracking)
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Tooltip title="Requires additional data">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InfoOutlinedIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Leadership Bonus: 1% from subordinate total sales
                  </Typography>
                </Box>
              </Tooltip>
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
