import { Box, Typography, Alert } from "@mui/material";

/**
 * Displayed when no employees are found
 */
export const NoEmployeesState = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Time Breakdowns
    </Typography>
    <Alert severity="warning" sx={{ mb: 3 }}>
      <Typography>
        No employees found. Please add employees in the Employees page first.
      </Typography>
    </Alert>
  </Box>
);

/**
 * Displayed when no data is available
 */
export const NoDataState = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Time Breakdowns
    </Typography>
    <Typography>Please fetch data first using the Fetch Data tab.</Typography>
  </Box>
);

/**
 * Alert for date parsing issues
 */
export const ParsingErrorAlert = ({ debugInfo }) => (
  <Alert severity="warning" sx={{ mb: 3 }}>
    <Typography variant="body2">
      <strong>Parsing issue detected:</strong> Could not parse time from{" "}
      {debugInfo.total} date entries.
      <br />
      Example date format: "{debugInfo.example}"
      <br />
      Check that your date includes time information in format: "DD-MM-YYYY
      HH:MM:SS AM/PM"
    </Typography>
  </Alert>
);
