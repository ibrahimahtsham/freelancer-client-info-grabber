import React from "react";
import { Button, TextField, Typography } from "@mui/material";

const MessageForm = ({
  clientId,
  message,
  setMessage,
  clientName,
  city,
  onSendMessage,
}) => {
  const handleSendMessage = () => {
    if (clientId && message) {
      onSendMessage(clientId, message);
      setMessage("");
    } else {
      alert("Make sure all fields are filled.");
    }
  };

  const handleCopyMessage = () => {
    const copyText = `Hi ${
      clientName || "Client"
    },\n\nI hold the highest ranking on Freelancer with a strong track record of delivering exceptional results and client satisfaction. But rather than focusing on me, I am more interested in learning about your project and how I can help.\n\nMy goal is always to understand your challenge, collaborate with you, and bring your idea to life through technology.\n\nIf you have a moment, feel free to check out my portfolio projects:\nhttps://www.chamberofcommerce.com\nhttps://www.boostifai.com.\n\nLooking forward to discussing your project further!\n\nWhy Choose Me?\n\nCommunication: Strong English skills in both speaking and writing.\nAttitude: Goal-oriented with a "get things done" mindset.\nPassion: Always eager to learn, take on challenges, and work with 100% ownership.\n\nP.S. How is the weather in ${
      city || "your city"
    } today?`;

    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        alert("Message copied to clipboard!");
      })
      .catch((err) => {
        console.error("Copy failed", err);
      });
  };

  return (
    <div>
      <Typography variant="h6">💬 Send Message</Typography>
      <TextField
        label="Client ID"
        value={clientId}
        InputProps={{ readOnly: true }}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        multiline
        rows={4}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSendMessage}>
        Send Message
      </Button>
      <Button
        variant="outlined"
        onClick={handleCopyMessage}
        style={{ marginLeft: "10px" }}
      >
        📋 Copy Custom Intro Message
      </Button>
    </div>
  );
};

export default MessageForm;
