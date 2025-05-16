import React from "react";
import { Paper, Typography } from "@mui/material";
import ThreadsDataGrid from "./ThreadsDataGrid";

const FilteredThreadsSection = ({ bg, title, threads, loading }) => (
  <Paper sx={{ p: 2, borderRadius: 2, background: bg }}>
    <Typography variant="h6" sx={{ mb: 1 }}>
      {title}
    </Typography>
    <ThreadsDataGrid threads={threads} loading={loading} />
  </Paper>
);

export default FilteredThreadsSection;
