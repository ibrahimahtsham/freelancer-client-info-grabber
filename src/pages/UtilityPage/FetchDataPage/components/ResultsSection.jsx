import { Typography, Paper } from "@mui/material";
import DataTable from "../../components/DataTable";

const ResultsSection = ({ rows, loading }) => {
  if (!rows || rows.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        {loading ? (
          <Typography>Loading data...</Typography>
        ) : (
          <Typography>No data available. Please fetch data first.</Typography>
        )}
      </Paper>
    );
  }

  return <DataTable data={rows} title="Bid Analysis" loading={loading} />;
};

export default ResultsSection;
