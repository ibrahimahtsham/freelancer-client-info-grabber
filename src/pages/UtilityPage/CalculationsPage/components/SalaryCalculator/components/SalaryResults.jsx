import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Paper,
  Chip,
  Tooltip,
} from "@mui/material";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import AttachMoney from "@mui/icons-material/AttachMoney";
import TrendingUp from "@mui/icons-material/TrendingUp";
import MonetizationOn from "@mui/icons-material/MonetizationOn";
import Paid from "@mui/icons-material/Paid";
import Percent from "@mui/icons-material/Percent";
import WorkspacePremium from "@mui/icons-material/WorkspacePremium";
import Diamond from "@mui/icons-material/Diamond";
import TipsAndUpdates from "@mui/icons-material/TipsAndUpdates";
import Star from "@mui/icons-material/Star";
import Leaderboard from "@mui/icons-material/Leaderboard";
import Group from "@mui/icons-material/Group";
import Add from "@mui/icons-material/Add";

const SalaryResults = ({ salaryData, selectedEmployee }) => {
  if (!salaryData || !selectedEmployee) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please ensure there are projects within the selected team member's
            shift.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Format currency in USD
  const formatUSD = (amount) => `$${amount.toFixed(2)}`;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <CardContent
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h6" gutterBottom>
          {selectedEmployee.name}'s Compensation Summary
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={4}>
            <StatsCard
              title="Total Projects"
              value={salaryData.totalProjects}
              secondary={`${salaryData.awardedProjects} awarded`}
              icon={<TrendingUp />}
              color="#4285F4"
            />
          </Grid>

          <Grid item xs={6} md={4}>
            <StatsCard
              title="Monthly Sales"
              value={formatUSD(salaryData.monthlySalesUSD)}
              secondary={`Period: ${salaryData.periodMonths} months`}
              icon={<AttachMoney />}
              color="#0F9D58"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <StatsCard
              title="Paid Amount"
              value={formatUSD(salaryData.paidSalesUSD)}
              secondary={`For commission calculation`}
              icon={<Paid />}
              color="#DB4437"
            />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
            }}
          >
            <AccountBalanceWallet fontSize="small" sx={{ mr: 1 }} />
            Compensation Breakdown
          </Typography>

          <CompensationItem
            title="Base Salary"
            valueUSD={salaryData.baseSalaryUSD}
          />

          <CompensationItem
            title="Sales Commission"
            valueUSD={salaryData.commissionUSD}
            showPercentage={
              salaryData.paidSalesUSD > 0
                ? `${(
                    (salaryData.commissionUSD / salaryData.paidSalesUSD) *
                    100
                  ).toFixed(1)}%`
                : "0%"
            }
          />

          <CompensationItem
            title="Attendance Bonus"
            valueUSD={salaryData.attendanceBonusUSD}
          />

          <CompensationItem
            title="Quality Bonus"
            valueUSD={salaryData.qualityBonusUSD}
          />

          <CompensationItem
            title="Sales Maturity Bonus"
            valueUSD={salaryData.salesMaturityBonusUSD}
          />

          <CompensationItem
            title="Consistency Bonus"
            valueUSD={salaryData.consistencyBonusUSD}
          />

          {salaryData.processAssistBonusUSD > 0 && (
            <CompensationItem
              title="Process Assist Bonus"
              valueUSD={salaryData.processAssistBonusUSD}
            />
          )}

          {salaryData.leadershipBonusUSD > 0 && (
            <CompensationItem
              title="Leadership Bonus"
              valueUSD={salaryData.leadershipBonusUSD}
            />
          )}
        </Paper>

        <Box sx={{ mt: "auto" }}>
          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Total for {salaryData.periodMonths}{" "}
              {salaryData.periodMonths > 1 ? "months" : "month"}
            </Typography>

            <Chip
              icon={<Paid />}
              label={formatUSD(salaryData.totalCompensationUSD)}
              color="success"
              sx={{ fontWeight: "bold" }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Stats card subcomponent
const StatsCard = ({ title, value, secondary, icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      height: "100%",
      border: "1px solid rgba(0,0,0,0.12)",
      position: "relative",
      overflow: "hidden",
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: 5,
        height: "100%",
        backgroundColor: color,
      },
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
        {secondary && (
          <Typography variant="caption" color="text.secondary">
            {secondary}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          color: color,
          bgcolor: `${color}15`,
          p: 1,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

// Compensation item subcomponent
const CompensationItem = ({ title, valueUSD, showPercentage }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      mb: 1,
    }}
  >
    <Typography variant="body2">
      {title}
      {showPercentage && (
        <Typography
          component="span"
          variant="caption"
          sx={{ ml: 1, color: "text.secondary" }}
        >
          ({showPercentage})
        </Typography>
      )}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        ${valueUSD.toFixed(2)}
      </Typography>
    </Box>
  </Box>
);

export default SalaryResults;
