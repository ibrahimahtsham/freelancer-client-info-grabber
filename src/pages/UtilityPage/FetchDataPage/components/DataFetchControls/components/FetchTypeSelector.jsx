import {
  Box,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { FETCH_TYPES } from "../utils/constants";

const FetchTypeSelector = ({ fetchType, setFetchType }) => {
  return (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Data Type
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          value={fetchType}
          onChange={(e) => setFetchType(e.target.value)}
        >
          {FETCH_TYPES.map((type) => (
            <FormControlLabel
              key={type.value}
              value={type.value}
              control={<Radio />}
              label={
                <Tooltip title={type.description} placement="right">
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2">{type.label}</Typography>
                    <InfoIcon fontSize="small" sx={{ ml: 1, opacity: 0.7 }} />
                  </Box>
                </Tooltip>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
    </>
  );
};

export default FetchTypeSelector;
