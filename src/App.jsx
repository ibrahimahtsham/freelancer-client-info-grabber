import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ClientInfoForm from "./components/ClientInfoForm";
import MessageForm from "./components/MessageForm";
import DetailsModal from "./components/DetailsModal";

function flatten(obj, prefix = "") {
  let flat = {};
  for (const key in obj) {
    if (
      obj[key] !== null &&
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(flat, flatten(obj[key], prefix ? `${prefix}.${key}` : key));
    } else {
      flat[prefix ? `${prefix}.${key}` : key] = obj[key];
    }
  }
  return flat;
}

export default function App() {
  const [clientInfo, setClientInfo] = useState(null);
  const [projectId, setProjectId] = useState("39325440");
  const [clientId, setClientId] = useState("");
  const [message, setMessage] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  const handleClientInfoFetched = (info) => {
    setClientInfo(info);
    setClientId(info?.project?.owner_id || "");
    const city = info?.client?.location?.city || "your city";
    setMessage(
      `Hi ${
        info?.client?.public_name || info?.client?.username
      }, How is the weather in ${city} today?`
    );
    // Flatten all details for modal, including thread
    let details = {
      ...flatten(info.project, "project"),
      ...flatten(info.client, "client"),
      ...(info.thread ? flatten(info.thread, "thread") : {}),
    };
    setAdditionalDetails(details);
  };

  return (
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
  );
}
