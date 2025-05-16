import React from "react";
import ClientInfoForm from "../components/ClientInfoForm";
import MessageForm from "../components/MessageForm";
import DetailsModal from "../components/DetailsModal";

const ClientPage = (props) => (
  <>
    <ClientInfoForm {...props} />
    <hr style={{ margin: "2em 0" }} />
    <MessageForm {...props} onSendMessage={props.handleSendMessage} />
    <DetailsModal {...props} />
  </>
);
export default ClientPage;
