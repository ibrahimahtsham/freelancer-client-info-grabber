import { Box } from "@mui/material";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      sx={{ mt: 2 }}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

export default TabPanel;
