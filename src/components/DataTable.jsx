import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { GridToolbar } from "@mui/x-data-grid";

const columns = [
  // Add this new row numbering column at the beginning
  {
    field: "sequenceNumber",
    headerName: "#",
    width: 70,
    sortable: false,
    filterable: false,
    disableExport: true,
    renderCell: (params) => {
      return params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1;
    },
  },
  { field: "threadId", headerName: "Thread ID", width: 150 },
  { field: "ownerId", headerName: "Owner ID", width: 150 },
  { field: "projectId", headerName: "Project ID", width: 150 },
  { field: "contextType", headerName: "Context Type", width: 150 },
  { field: "projectTitle", headerName: "Project Title", width: 200 },
  { field: "projectUploadDate", headerName: "Project Upload Date", width: 200 },
  { field: "firstMessageDate", headerName: "First Message Date", width: 200 },
  { field: "projectBidPrice", headerName: "Project Bid Price", width: 180 },
  {
    field: "projectLink",
    headerName: "Project Link",
    width: 200,
    renderCell: (params) => (
      <a href={params.value} target="_blank" rel="noopener noreferrer">
        View
      </a>
    ),
  },
  { field: "ownerName", headerName: "Owner Name", width: 150 },
  { field: "ownerLocation", headerName: "Owner Location", width: 150 },
  {
    field: "clientProfileLink",
    headerName: "Client Profile Link",
    width: 200,
    renderCell: (params) => (
      <a href={params.value} target="_blank" rel="noopener noreferrer">
        Profile
      </a>
    ),
  },
  { field: "yourBidAmount", headerName: "Your Bid Amount", width: 150 },
  {
    field: "totalPaidMilestones",
    headerName: "Total Paid (Milestones)",
    width: 200,
  },
  { field: "awarded", headerName: "Awarded", width: 120 },
  { field: "otherStatus", headerName: "Other Status", width: 150 },
];

const DataTable = ({ rows = [], loading }) => {
  // Add this effect to log when the component receives new rows
  useEffect(() => {
    console.log(
      `DataTable component received rows update: ${rows?.length || 0} rows`
    );

    // Log data sample for debugging
    if (rows && rows.length > 0) {
      console.log("Data sample:", rows[0]);
    }
  }, [rows]);

  // For debugging: log rows changes
  useEffect(() => {
    console.log("DataTable received rows update:", rows?.length || 0);
  }, [rows]);

  // If rows is empty but not loading, show a message
  if (!loading && (!rows || rows.length === 0)) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography>
          No data to display. Please select a dataset or fetch data.
        </Typography>
      </Box>
    );
  }

  return (
    <div style={{ height: 500, width: "100%", overflow: "auto" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
        slots={{
          toolbar: GridToolbar,
        }}
        sx={{ width: "100%" }}
      />
    </div>
  );
};

export default DataTable;
