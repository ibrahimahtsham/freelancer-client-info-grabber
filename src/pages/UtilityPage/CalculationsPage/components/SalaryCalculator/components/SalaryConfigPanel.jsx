import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  DateRange as DateRangeIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";

const SalaryConfigPanel = ({
  baseSalary,
  setBaseSalary,
  calculationPeriodMonths,
  setCalculationPeriodMonths,
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
          <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
          Base Configuration
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <AttachMoneyIcon
              fontSize="small"
              sx={{ color: "text.secondary", mr: 1 }}
            />
            <Typography variant="body2">Base Salary (Monthly)</Typography>
            <Tooltip title="Monthly base salary in USD">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            type="number"
            size="small"
            value={baseSalary}
            onChange={(e) => setBaseSalary(Number(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Slider
            value={baseSalary}
            onChange={(e, newValue) => setBaseSalary(newValue)}
            min={50}
            max={500}
            step={10}
            valueLabelDisplay="auto"
            valueLabelFormat={(x) => `$${x}`}
            marks={[
              { value: 50, label: "$50" },
              { value: 180, label: "$180" },
              { value: 500, label: "$500" },
            ]}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <DateRangeIcon
                fontSize="small"
                sx={{ color: "text.secondary", mr: 1 }}
              />
              <Typography variant="body2">
                Calculation Period: {calculationPeriodMonths}{" "}
                {calculationPeriodMonths > 1 ? "months" : "month"}
              </Typography>
              <Tooltip title="Period for salary calculation">
                <IconButton size="small" sx={{ ml: 0.5 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Slider
              value={calculationPeriodMonths}
              onChange={(e, newValue) => setCalculationPeriodMonths(newValue)}
              step={1}
              marks
              min={1}
              max={12}
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalaryConfigPanel;
