import React from 'react';
import { Box, Stepper, Step, StepLabel, StepButton, useTheme, useMediaQuery } from '@mui/material';

const StatsStepper = ({ steps, activeStep, setActiveStep }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel={isMobile} 
        nonLinear
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepButton onClick={() => setActiveStep(index)}>
              <StepLabel>{step.label}</StepLabel>
            </StepButton>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default StatsStepper;