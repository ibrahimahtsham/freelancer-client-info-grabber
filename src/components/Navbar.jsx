import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import BuildIcon from "@mui/icons-material/Build";
import { Link as RouterLink, useLocation } from "react-router-dom";
import TokenManager from "./TokenManager";

const Navbar = ({ mode, toggleMode }) => {
  const location = useLocation();

  // Style for active navigation button
  const activeButtonStyle = {
    backgroundColor:
      mode === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)",
    borderBottom: `2px solid ${mode === "dark" ? "#fff" : "#1976d2"}`,
    borderRadius: "4px 4px 0 0",
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Freelancer Client Info Grabber
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          color="inherit"
          startIcon={<PersonIcon />}
          sx={{
            minWidth: "100px",
            ...(location.pathname === "/" ? activeButtonStyle : {}),
          }}
        >
          Client
        </Button>
        <Button
          component={RouterLink}
          to="/utility"
          color="inherit"
          startIcon={<BuildIcon />}
          sx={{
            minWidth: "100px",
            ...(location.pathname === "/utility" ? activeButtonStyle : {}),
          }}
        >
          Utility
        </Button>
        <Button
          component={RouterLink}
          to="/employees"
          color="inherit"
          startIcon={<PeopleIcon />}
          sx={{
            minWidth: "100px",
            ...(location.pathname === "/employees" ? activeButtonStyle : {}),
          }}
        >
          Employees
        </Button>
        <TokenManager />
        <IconButton color="inherit" onClick={toggleMode}>
          {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
