import { useState } from "react";
import { Container, Button } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import useThemeMode from "./utils/useThemeMode";
import useClientInfo from "./pages/ClientPage/utils/useClientInfo";
import { sendMessageWithThread } from "./pages/ClientPage/apis/message";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import UtilityPage from "./pages/UtilityPage";
import { DEFAULT_VALUES } from "./constants"; // Import constants

export default function App() {
  const { mode, theme, toggleMode } = useThemeMode("dark");
  // Use the constant for default project ID
  const [projectId, setProjectId] = useState(DEFAULT_VALUES.PROJECT_ID);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    clientInfo,
    additionalDetails,
    clientId,
    message,
    setMessage,
    fetchAndSetClientInfo,
    loading,
    error,
  } = useClientInfo();

  const handleSendMessage = async (clientId, projectId, message) => {
    return sendMessageWithThread(clientId, projectId, message);
  };

  // Props to pass to ClientPage
  const clientPageProps = {
    projectId,
    setProjectId,
    onFetched: fetchAndSetClientInfo,
    clientInfo,
    loading,
    error,
    clientId,
    message,
    setMessage,
    handleSendMessage,
    modalOpen,
    setModalOpen,
    additionalDetails,
  };

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
                <ClientPage {...clientPageProps} />
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
