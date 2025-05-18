import { useState, useEffect } from "react";
import { Button, Typography, Box, Paper } from "@mui/material";

const TestLocalStorage = () => {
  const [datasets, setDatasets] = useState([]);
  const [loadedRows, setLoadedRows] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = () => {
    const found = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("dataset_")) {
        try {
          const dataset = JSON.parse(localStorage.getItem(key));
          found.push({
            id: key,
            rowCount: dataset.rows?.length || 0,
            metadata: dataset.metadata || {},
          });
        } catch (e) {
          console.error("Failed to parse dataset", e);
        }
      }
    }
    setDatasets(found);
  };

  const loadDataset = (id) => {
    try {
      const data = localStorage.getItem(id);
      if (!data) {
        setMessage(`Dataset ${id} not found!`);
        return;
      }

      const parsedData = JSON.parse(data);
      if (!parsedData || !Array.isArray(parsedData.rows)) {
        setMessage(`Dataset ${id} has invalid format!`);
        return;
      }

      setLoadedRows(parsedData.rows);
      setMessage(
        `Successfully loaded ${parsedData.rows.length} rows from ${id}`
      );
    } catch (e) {
      setMessage(`Error loading dataset: ${e.message}`);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        LocalStorage Test
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={loadDatasets}>
          Refresh Datasets
        </Button>
        <Typography sx={{ mt: 1 }}>{message}</Typography>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Available Datasets:
      </Typography>
      {datasets.length === 0 ? (
        <Typography>No datasets found in localStorage</Typography>
      ) : (
        datasets.map((dataset) => (
          <Box key={dataset.id} sx={{ mb: 1, p: 1, border: "1px solid #ddd" }}>
            <Typography variant="body2">ID: {dataset.id}</Typography>
            <Typography variant="body2">Rows: {dataset.rowCount}</Typography>
            <Button
              size="small"
              variant="contained"
              onClick={() => loadDataset(dataset.id)}
            >
              Test Load
            </Button>
          </Box>
        ))
      )}

      <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
        Loaded Data Sample:
      </Typography>
      <Typography variant="body2">
        {loadedRows.length > 0
          ? `Loaded ${loadedRows.length} rows. First row: ${JSON.stringify(
              loadedRows[0]
            ).substring(0, 100)}...`
          : "No data loaded"}
      </Typography>
    </Paper>
  );
};

export default TestLocalStorage;
