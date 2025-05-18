import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  Tooltip,
  Paper,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaidIcon from "@mui/icons-material/Paid";
import AddTaskIcon from "@mui/icons-material/AddTask";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const SalaryResults = ({ salaryData, selectedEmployee }) => {
  if (!salaryData) {
    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
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

  // Format currency
  const formatUSD = (amount) => `$${amount.toFixed(2)}`;
  const formatPKR = (amount) =>
    `₨ ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

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
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: selectedEmployee?.color || "#1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
              color: "#fff",
            }}
          >
            {selectedEmployee?.name?.charAt(0) || "E"}
          </Box>
          <Box>
            <Typography variant="h6">
              {selectedEmployee?.name || "Employee"}'s Compensation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Based on {salaryData.totalProjects} total projects (
              {salaryData.awardedProjects} awarded)
            </Typography>
          </Box>
        </Box>

        {/* Stats cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={6}>
            <StatsCard
              title="Total Sales"
              value={formatUSD(salaryData.totalSalesUSD)}
              secondary={`Monthly: ${formatUSD(salaryData.monthlySalesUSD)}`}
              icon={<TrendingUpIcon />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={6} md={6}>
            <StatsCard
              title="Projects"
              value={salaryData.totalProjects}
              secondary={`${salaryData.awardedProjects} awarded (${Math.round(
                (salaryData.awardedProjects / salaryData.totalProjects) * 100
              )}%)`}
              icon={<WorkIcon />}
              color="#ff9800"
            />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{ p: 2, bgcolor: "rgba(0,0,0,0.02)", borderRadius: 2, mb: 3 }}
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
            <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1 }} />
            Compensation Breakdown
          </Typography>

          <CompensationItem
            title="Base Salary"
            valueUSD={salaryData.baseSalaryUSD}
            valuePKR={salaryData.baseSalaryPKR}
          />

          <CompensationItem
            title="Sales Commission"
            valueUSD={salaryData.commissionUSD}
            valuePKR={salaryData.commissionPKR}
            showPercentage={
              salaryData.totalSalesUSD > 0
                ? (
                    (salaryData.commissionUSD / salaryData.totalSalesUSD) *
                    100
                  ).toFixed(1) + "%"
                : "0%"
            }
          />

          <CompensationItem
            title="Attendance Bonus"
            valueUSD={salaryData.attendanceBonusUSD}
            valuePKR={salaryData.attendanceBonusPKR}
          />

          <CompensationItem
            title="Quality Bonus"
            valueUSD={salaryData.qualityBonusUSD}
            valuePKR={salaryData.qualityBonusPKR}
          />
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

            <Tooltip title={`${formatPKR(salaryData.totalCompensationPKR)}`}>
              <Chip
                icon={<PaidIcon />}
                label={formatUSD(salaryData.totalCompensationUSD)}
                color="success"
                sx={{ fontWeight: "bold" }}
              />
            </Tooltip>
          </Box>

          {salaryData.periodMonths > 1 && (
            <Box sx={{ textAlign: "right", mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Monthly Average:{" "}
                {formatUSD(
                  salaryData.totalCompensationUSD / salaryData.periodMonths
                )}
              </Typography>
            </Box>
          )}
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
const CompensationItem = ({ title, valueUSD, valuePKR, showPercentage }) => (
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
      <Tooltip title="PKR value">
        <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
          (₨ {Math.round(valuePKR).toLocaleString()})
        </Typography>
      </Tooltip>
    </Box>
  </Box>
);

export default SalaryResults;
