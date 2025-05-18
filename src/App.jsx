import { Container } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import useThemeMode from "./utils/useThemeMode";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import UtilityPage from "./pages/UtilityPage";
import EmployeePage from "./pages/EmployeePage";
import { EmployeeProvider } from "./contexts/EmployeeContext";

export default function App() {
  const { mode, theme, toggleMode } = useThemeMode("dark");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
