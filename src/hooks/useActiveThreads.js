import { useState } from "react";
import { fetchThreadsWithProjectAndOwnerInfo } from "../utils/api/analytics";

export default function useActiveThreads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const getThreads = async () => {
    setLoading(true);
    setError("");
    setProgress(0);
    setProgressText("");
    try {
      const data = await fetchThreadsWithProjectAndOwnerInfo((pct, text) => {
        setProgress(pct);
        setProgressText(text);
      });
      setThreads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressText("");
    }
  };

  return { threads, loading, error, getThreads, progress, progressText };
}
