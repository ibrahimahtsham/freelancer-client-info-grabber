import { useState } from "react";
import { fetchClientInfo } from "../utils/api/client";
import flatten from "../utils/flatten";

export default function useClientInfo() {
  const [clientInfo, setClientInfo] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState({});
  const [clientId, setClientId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAndSetClientInfo = async (projectId) => {
    setLoading(true);
    setError("");
    try {
      const info = await fetchClientInfo(projectId);
      setClientInfo(info);
      setClientId(info?.project?.owner_id || "");
      const city = info?.client?.location?.city || "your city";
      setMessage(
        `Hi ${
          info?.client?.public_name || info?.client?.username
        }, How is the weather in ${city} today?`
      );
      setAdditionalDetails({
        ...flatten(info.project, "project"),
        ...flatten(info.client, "client"),
        ...(info.thread ? flatten(info.thread, "thread") : {}),
      });
    } catch (err) {
      if (err.name === "ApiError") {
        setError(`API Error (${err.status}): ${err.message}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    clientInfo,
    additionalDetails,
    clientId,
    message,
    setMessage,
    fetchAndSetClientInfo,
    loading,
    error,
  };
}
