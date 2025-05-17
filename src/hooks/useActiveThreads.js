import { useState } from "react";
import { fetchThreadsWithProjectAndOwnerInfo } from "../utils/api/analytics";

export default function useActiveThreads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // Accept both fromDate and toDate
  const getThreads = async (maxThreads, fromDate, toDate) => {
    setLoading(true);
    setError("");
    setProgress(0);
    setProgressText("");
    try {
      const data = await fetchThreadsWithProjectAndOwnerInfo(
        (pct, text) => {
          setProgress(pct);
          setProgressText(text);
        },
        maxThreads,
        fromDate,
        toDate
      );
      setThreads(data);
    } catch (err) {
      // Improved error handling for ApiError
      if (err.name === "ApiError") {
        setError(`API Error (${err.status}): ${err.message}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressText("");
    }
  };

  return { threads, loading, error, getThreads, progress, progressText };
}
