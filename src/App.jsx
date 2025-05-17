import { useState } from "react";
import { Container, Button } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import useThemeMode from "./hooks/useThemeMode";
import useClientInfo from "./hooks/useClientInfo";
import { sendMessageWithThread } from "./utils/api/message";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import UtilityPage from "./pages/UtilityPage";

export default function App() {
  const { mode, theme, toggleMode } = useThemeMode("dark");
  const [projectId, setProjectId] = useState("39325440");
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
