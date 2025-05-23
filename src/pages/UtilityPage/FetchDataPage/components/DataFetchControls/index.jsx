import { Grid, Paper } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Import components
import DateRangeSelector from "./components/DateRangeSelector";
import FetchTypeSelector from "./components/FetchTypeSelector";
import LimitControls from "./components/LimitControls";

const DataFetchControls = ({
  fromDateTime,
  setFromDateTime,
  toDateTime,
  setToDateTime,
  limitEnabled,
  setLimitEnabled,
  limit,
  setLimit,
  fetchType,
  setFetchType,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={3}>
          {/* DateTime Range Controls */}
          <Grid item xs={12} md={4}>
            <DateRangeSelector
              fromDateTime={fromDateTime}
              setFromDateTime={setFromDateTime}
              toDateTime={toDateTime}
              setToDateTime={setToDateTime}
            />
          </Grid>

          {/* Fetch Type Controls */}
          <Grid item xs={12} md={5}>
            <FetchTypeSelector
              fetchType={fetchType}
              setFetchType={setFetchType}
            />
          </Grid>

          {/* Limit Controls */}
          <Grid item xs={12} md={3}>
            <LimitControls
              limitEnabled={limitEnabled}
              setLimitEnabled={setLimitEnabled}
              limit={limit}
              setLimit={setLimit}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Paper>
  );
};

export default DataFetchControls;
