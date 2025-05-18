import { Container } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import useThemeMode from "./utils/useThemeMode";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import UtilityPage from "./pages/UtilityPage";

export default function App() {
  const { mode, theme, toggleMode } = useThemeMode("dark");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar mode={mode} toggleMode={toggleMode} />
        <Routes>
          <Route
            path="/"
            element={
              <Container maxWidth="md" sx={{ mt: 4 }}>
                <ClientPage />
              </Container>
            }
          />
          <Route
            path="/utility"
            element={
              <Container maxWidth={false} sx={{ mt: 4, px: 2 }}>
                <UtilityPage />
              </Container>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
