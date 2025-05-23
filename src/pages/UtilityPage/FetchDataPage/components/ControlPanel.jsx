import { Box } from "@mui/material";
import DataFetchControls from "./DataFetchControls";

const ControlPanel = ({ controls }) => {
  return <DataFetchControls {...controls} />;
};

export default ControlPanel;
