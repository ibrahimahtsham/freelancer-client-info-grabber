import { useState } from "react";
import { Container, Button } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import ClientInfoForm from "./components/ClientInfoForm";
import MessageForm from "./components/MessageForm";
import DetailsModal from "./components/DetailsModal";
import Navbar from "./components/Navbar";
import useThemeMode from "./hooks/useThemeMode";
import useClientInfo from "./hooks/useClientInfo";
import { sendMessageWithThread } from "./utils/api/message";

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar mode={mode} toggleMode={toggleMode} />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <ClientInfoForm
          projectId={projectId}
          setProjectId={setProjectId}
          onFetched={fetchAndSetClientInfo}
          clientInfo={clientInfo}
          loading={loading}
          error={error}
        />
        <hr style={{ margin: "2em 0" }} />
        <MessageForm
          clientId={clientId}
          projectId={projectId}
          message={message}
          setMessage={setMessage}
          clientName={
            clientInfo?.client?.public_name || clientInfo?.client?.username
          }
          city={clientInfo?.client?.location?.city}
          onSendMessage={handleSendMessage}
        />
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => setModalOpen(true)}
          disabled={!clientInfo}
        >
          Show Additional Details
        </Button>
        <DetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          details={additionalDetails}
        />
      </Container>
    </ThemeProvider>
  );
}
