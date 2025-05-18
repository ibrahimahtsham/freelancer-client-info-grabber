import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Slider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import DateRangeIcon from "@mui/icons-material/DateRange";

const SalaryConfigPanel = ({
  baseSalary,
  setBaseSalary,
  usdToPkrRate,
  setUsdToPkrRate,
  calculationPeriodMonths,
  setCalculationPeriodMonths,
}) => {
  return (
    <Card
      sx={{ mb: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      <CardContent>
        <Accordion defaultExpanded elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "rgba(25, 118, 210, 0.04)",
              borderRadius: 1,
            }}
          >
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AttachMoneyIcon fontSize="small" />
              Basic Salary Parameters
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
              <TextField
                label="Base Monthly Salary"
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                fullWidth
              />
              <Tooltip title="The base monthly salary in USD">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CurrencyExchangeIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mr: 1 }}
                  />
                  <Typography variant="body2">
                    USD to PKR Rate: {usdToPkrRate}
                  </Typography>
                </Box>
                <Slider
                  value={usdToPkrRate}
                  onChange={(e, newValue) => setUsdToPkrRate(newValue)}
                  min={250}
                  max={350}
                  step={1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 250, label: "250" },
                    { value: 300, label: "300" },
                    { value: 350, label: "350" },
                  ]}
                />
              </Box>
              <Tooltip title="Current exchange rate from USD to PKR">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <DateRangeIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mr: 1 }}
                  />
                  <Typography variant="body2">
                    Calculation Period: {calculationPeriodMonths}{" "}
                    {calculationPeriodMonths > 1 ? "months" : "month"}
                  </Typography>
                </Box>
                <Slider
                  value={calculationPeriodMonths}
                  onChange={(e, newValue) =>
                    setCalculationPeriodMonths(newValue)
                  }
                  min={1}
                  max={12}
                  step={1}
                  marks={[
                    { value: 1, label: "1" },
                    { value: 3, label: "3" },
                    { value: 6, label: "6" },
                    { value: 12, label: "12" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Tooltip title="Period for which to calculate the compensation">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default SalaryConfigPanel;
