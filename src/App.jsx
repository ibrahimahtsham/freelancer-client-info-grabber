import { useState } from "react";
import { Container, Button } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import ClientInfoForm from "./components/ClientInfoForm";
import MessageForm from "./components/MessageForm";
import DetailsModal from "./components/DetailsModal";
import Navbar from "./components/Navbar";
import flatten from "./utils/flatten";
import useThemeMode from "./hooks/useThemeMode";

export default function App() {
  const { mode, theme, toggleMode } = useThemeMode("dark");

  const [clientInfo, setClientInfo] = useState(null);
  const [projectId, setProjectId] = useState("39325440");
  const [clientId, setClientId] = useState("");
  const [message, setMessage] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [threadId, setThreadId] = useState("");

  const handleClientInfoFetched = (info) => {
    setClientInfo(info);
    setClientId(info?.project?.owner_id || "");
    setThreadId(info?.thread?.id || "");
    const city = info?.client?.location?.city || "your city";
    setMessage(
      `Hi ${
        info?.client?.public_name || info?.client?.username
      }, How is the weather in ${city} today?`
    );
    let details = {
      ...flatten(info.project, "project"),
      ...flatten(info.client, "client"),
      ...(info.thread ? flatten(info.thread, "thread") : {}),
    };
    setAdditionalDetails(details);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar mode={mode} toggleMode={toggleMode} />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <ClientInfoForm
          projectId={projectId}
          setProjectId={setProjectId}
          onFetched={handleClientInfoFetched}
        />
        <hr style={{ margin: "2em 0" }} />
        <MessageForm
          clientId={clientId}
          setClientId={setClientId}
          message={message}
          setMessage={setMessage}
          projectId={projectId}
          clientName={
            clientInfo?.client?.public_name || clientInfo?.client?.username
          }
          city={clientInfo?.client?.location?.city}
          threadId={threadId}
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
