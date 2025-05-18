import { useState } from "react";
import { Button } from "@mui/material";
import ClientInfoForm from "./components/ClientInfoForm";
import MessageForm from "./components/MessageForm";
import DetailsModal from "./components/DetailsModal";
import useClientInfo from "./utils/useClientInfo";
import { sendMessageWithThread } from "./apis/message";
import { DEFAULT_VALUES } from "../../constants";

const ClientPage = () => {
  // Move state from App.jsx to here
  const [projectId, setProjectId] = useState(DEFAULT_VALUES.PROJECT_ID);
  const [modalOpen, setModalOpen] = useState(false);

  // Use the custom hook directly in this component
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

  // Move handleSendMessage function from App.jsx
  const handleSendMessage = async (clientId, projectId, message) => {
    return sendMessageWithThread(clientId, projectId, message);
  };

  return (
    <>
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
        onSendMessage={handleSendMessage}
        clientName={
          clientInfo?.client?.public_name || clientInfo?.client?.username
        }
        city={clientInfo?.client?.location?.city}
      />

      {/* MUI Button to open modal */}
      {clientInfo && (
        <Button
          onClick={() => setModalOpen(true)}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Show Detailed Client Information
        </Button>
      )}

      <DetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        details={additionalDetails}
      />
    </>
  );
};

export default ClientPage;
