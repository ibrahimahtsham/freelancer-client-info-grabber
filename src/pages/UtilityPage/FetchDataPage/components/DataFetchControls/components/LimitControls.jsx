import {
  Box,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const LimitControls = ({ limitEnabled, setLimitEnabled, limit, setLimit }) => {
  return (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Result Limit
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={limitEnabled}
              onChange={(e) => setLimitEnabled(e.target.checked)}
            />
          }
          label="Enable Limit"
        />

        <TextField
          label="Max Results"
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
          disabled={!limitEnabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip title="Limits the total number of results fetched from the API">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </>
  );
};

export default LimitControls;
