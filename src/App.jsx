import { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import TokenSetupDialog from "./components/TokenSetupDialog";
import useThemeMode from "./utils/useThemeMode";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import UtilityPage from "./pages/UtilityPage";
import EmployeePage from "./pages/EmployeePage";
import { EmployeeProvider } from "./contexts/EmployeeContext";
import { getStoredToken } from "./utils/tokenHelper";

export default function App() {
  const { mode, theme, toggleMode } = useThemeMode("dark");
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Check if token exists
    const token = getStoredToken();
    if (!token) {
      setTokenDialogOpen(true);
    } else {
      setAppReady(true);
    }
  }, []);

  const handleTokenDialogClose = (success) => {
    setTokenDialogOpen(false);
    if (success) {
      // Token was successfully saved
      setAppReady(true);
      // Force reload to apply the new token
      window.location.reload();
    }
  };

  // Show minimal UI when app is not ready
  if (!appReady && tokenDialogOpen) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TokenSetupDialog
          open={tokenDialogOpen}
          onClose={handleTokenDialogClose}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TokenSetupDialog
        open={tokenDialogOpen}
        onClose={handleTokenDialogClose}
      />
      <EmployeeProvider>
        <Router>
          <Navbar mode={mode} toggleMode={toggleMode} />
          <Routes>
            <Route
              path="/"
              element={
                <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
                  <ClientPage />
                </Container>
              }
            />
            <Route
              path="/utility"
              element={
                <Container maxWidth={false} sx={{ mt: 4, px: 2, mb: 6 }}>
                  <UtilityPage />
                </Container>
              }
            />
            <Route
              path="/employees"
              element={
                <Container maxWidth={false} sx={{ mt: 4, px: 2, mb: 6 }}>
                  <EmployeePage />
                </Container>
              }
            />
          </Routes>
        </Router>
      </EmployeeProvider>
    </ThemeProvider>
  );
}
