import {
  Box,
  Typography,
  Slider,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import DataFetchControls from "./DataFetchControls";

const ControlPanel = ({ controls }) => {
  return (
    <Box sx={{ mb: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
      <DataFetchControls {...controls} />

      <Box sx={{ mb: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          API Rate Limit Aggressiveness
        </Typography>
        <Slider
          value={controls.rateLimit?.aggressiveness * 100 || 70} // Default to 70% if undefined
          onChange={(e, newValue) =>
            controls.rateLimit?.setAggressiveness(newValue / 100)
          }
          valueLabelDisplay="auto"
          step={10}
          marks
          min={10}
          max={100}
          valueLabelFormat={(value) => `${value}%`}
        />
        <Typography variant="caption" color="text.secondary">
          {controls.rateLimit?.aggressiveness < 0.3
            ? "Conservative: Slower but safer"
            : controls.rateLimit?.aggressiveness > 0.7
            ? "Aggressive: Faster but may hit rate limits"
            : "Balanced: Moderate speed and safety"}
        </Typography>
      </Box>
    </Box>
  );
};

export default ControlPanel;
