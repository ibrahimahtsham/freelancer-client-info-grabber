import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Link as RouterLink } from "react-router-dom";

const Navbar = ({ mode, toggleMode }) => (
  <AppBar position="static" color="default" elevation={1}>
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Freelancer Client Info Grabber
      </Typography>
      <Button component={RouterLink} to="/" color="inherit">
        Client
      </Button>
      <Button component={RouterLink} to="/utility" color="inherit">
        Utility
      </Button>
      <IconButton color="inherit" onClick={toggleMode}>
        {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Toolbar>
  </AppBar>
);

export default Navbar;
