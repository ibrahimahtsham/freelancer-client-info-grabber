import { Button, ButtonGroup } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

const DataActions = ({ onFetch, onSave, loading, hasData }) => {
  return (
    <ButtonGroup sx={{ mb: 3 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={onFetch}
        disabled={loading}
      >
        {loading ? "Fetching Data..." : "Fetch Data"}
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={onSave}
        disabled={loading || !hasData}
        startIcon={<SaveIcon />}
      >
        Save Data
      </Button>
    </ButtonGroup>
  );
};

export default DataActions;
