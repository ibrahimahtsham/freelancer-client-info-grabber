import {
  Card,
  CardContent,
  Typography,
  Box,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckIcon from "@mui/icons-material/Check";

const CommissionPanel = ({ commissionTiers, updateTierRate }) => {
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
              <ShowChartIcon fontSize="small" />
              Commission Structure
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Tooltip title="The commission percentage increases as sales increase">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InfoOutlinedIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Tiered commission rates based on monthly sales
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Object.entries(commissionTiers).map(
                ([tier, { min, max, rate }]) => (
                  <Grid item xs={6} key={tier}>
                    <CommissionTierCard
                      tier={tier}
                      min={min}
                      max={max === Infinity ? null : max}
                      rate={rate}
                    />
                  </Grid>
                )
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Tier 1 */}
            <TierSlider
              label="Tier 1"
              range={`$${commissionTiers.tier1.min} - $${commissionTiers.tier1.max}`}
              rate={commissionTiers.tier1.rate}
              onChange={(value) => updateTierRate("tier1", value)}
              color="#42a5f5"
            />

            {/* Tier 2 */}
            <TierSlider
              label="Tier 2"
              range={`$${commissionTiers.tier2.min} - $${commissionTiers.tier2.max}`}
              rate={commissionTiers.tier2.rate}
              onChange={(value) => updateTierRate("tier2", value)}
              color="#66bb6a"
            />

            {/* Tier 3 */}
            <TierSlider
              label="Tier 3"
              range={`$${commissionTiers.tier3.min} - $${commissionTiers.tier3.max}`}
              rate={commissionTiers.tier3.rate}
              onChange={(value) => updateTierRate("tier3", value)}
              color="#ffa726"
            />

            {/* Tier 4 */}
            <TierSlider
              label="Tier 4"
              range={`$${commissionTiers.tier4.min}+`}
              rate={commissionTiers.tier4.rate}
              onChange={(value) => updateTierRate("tier4", value)}
              color="#ef5350"
              max={20}
            />
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

// Commission tier card subcomponent
const CommissionTierCard = ({ tier, min, max, rate }) => {
  const tierColors = {
    tier1: "#42a5f5",
    tier2: "#66bb6a",
    tier3: "#ffa726",
    tier4: "#ef5350",
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: `${tierColors[tier]}10`,
        border: `1px solid ${tierColors[tier]}40`,
        height: "100%",
      }}
    >
      <Typography variant="body2" fontWeight={500} color={tierColors[tier]}>
        Tier {tier.slice(-1)}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {rate}%
        </Typography>
        <Chip
          size="small"
          variant="outlined"
          sx={{ borderColor: tierColors[tier], color: tierColors[tier] }}
          label={max ? `$${min}-${max}` : `$${min}+`}
        />
      </Box>
    </Box>
  );
};

// Tier slider subcomponent
const TierSlider = ({ label, range, rate, onChange, color, max = 15 }) => (
  <Box sx={{ mb: 3 }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1,
      }}
    >
      <Typography variant="body2" fontWeight={500}>
        {label}{" "}
        <Typography component="span" variant="caption">
          ({range})
        </Typography>
      </Typography>
      <Chip
        icon={<CheckIcon sx={{ fontSize: "0.7rem !important" }} />}
        label={`${rate}%`}
        size="small"
        sx={{
          bgcolor: `${color}20`,
          color: color,
          fontWeight: "bold",
          ".MuiChip-icon": {
            color: "inherit",
          },
        }}
      />
    </Box>
    <Slider
      value={rate}
      onChange={(e, newValue) => onChange(newValue)}
      valueLabelDisplay="auto"
      min={0}
      max={max}
      step={0.5}
      sx={{
        color: color,
        "& .MuiSlider-rail": {
          opacity: 0.3,
        },
      }}
    />
  </Box>
);

export default CommissionPanel;
