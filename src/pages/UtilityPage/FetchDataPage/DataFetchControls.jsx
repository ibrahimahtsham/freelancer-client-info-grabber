import { Box, TextField, FormControlLabel, Switch } from "@mui/material";
import DateRangeControls from "../../../components/DateRangeControls";

const DataFetchControls = ({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  limitEnabled,
  setLimitEnabled,
  limit,
  setLimit,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        my: 3,
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}
    >
      <DateRangeControls
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={limitEnabled}
              onChange={(e) => setLimitEnabled(e.target.checked)}
              name="limitToggle"
              color="primary"
            />
          }
          label="Enable Result Limit"
        />

        <TextField
          label="Result Limit"
          type="number"
          value={limit}
          onChange={(e) =>
            setLimit(Math.max(1, Math.min(1000, parseInt(e.target.value) || 5)))
          }
          InputProps={{ inputProps: { min: 1, max: 1000 } }}
          disabled={!limitEnabled}
          sx={{ width: 150 }}
        />
      </Box>
    </Box>
  );
};

export default DataFetchControls;
