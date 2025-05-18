import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useUtility } from "../UtilityContext/hooks";
import useStatsCalculation from "./hooks/useStatsCalculation";
import useBidsData from "./hooks/useBidsData";
import BasicStatsCards from "./components/BasicStatsCards";
import TimeDistribution from "./components/TimeDistribution";
import BidAnalysisChart from "./components/BidAnalysisChart";
import TeamComparison from "./components/TeamComparison";
import SalaryCalculator from "./components/SalaryCalculator";
import StatsStepper from "./components/StatsStepper";

const CalculationsPage = () => {
  const { rows } = useUtility();
  const [activeStep, setActiveStep] = useState(0);

  // Get statistics from our custom hooks
  const { stats, timeStats } = useStatsCalculation(rows);
  const { bidsData, bidsLoading, bidsError } = useBidsData(rows);

  // Steps for the stepper navigation
  const steps = [
    { label: "Summary Stats", component: <BasicStatsCards stats={stats} /> },
    {
      label: "Time Distribution",
      component: <TimeDistribution timeStats={timeStats} />,
    },
    {
      label: "Bid Analysis",
      component: (
        <BidAnalysisChart
          bidsData={bidsData}
          loading={bidsLoading}
          error={bidsError}
        />
      ),
    },
    {
      label: "Team Comparison",
      component: (
        <TeamComparison rows={rows} timeStats={timeStats} bidsData={bidsData} />
      ),
    },
    {
      label: "Salary Calculator",
      component: <SalaryCalculator rows={rows} bidsData={bidsData} />,
    },
  ];

  if (!stats) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Calculations
        </Typography>
        <Typography>
          Please fetch data first using the Fetch Data tab.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Calculations and Analysis
      </Typography>

      <StatsStepper
        steps={steps}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />

      <Box sx={{ mt: 4, mb: 4 }}>{steps[activeStep].component}</Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
          variant="outlined"
        >
          Previous
        </Button>
        <Button
          disabled={activeStep === steps.length - 1}
          onClick={() => setActiveStep((prev) => prev + 1)}
          variant="contained"
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default CalculationsPage;
