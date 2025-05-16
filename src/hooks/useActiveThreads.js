import { useState } from "react";
import { fetchThreadsWithProjectAndOwnerInfo } from "../utils/api/analytics";

export default function useActiveThreads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getThreads = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchThreadsWithProjectAndOwnerInfo();
      setThreads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { threads, loading, error, getThreads };
}
