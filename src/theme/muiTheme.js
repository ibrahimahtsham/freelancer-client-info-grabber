import { createTheme } from "@mui/material";

export const getMuiTheme = (mode = "dark") =>
  createTheme({
    palette: { mode },
  });
