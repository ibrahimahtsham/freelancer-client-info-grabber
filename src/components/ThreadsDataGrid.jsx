import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const columns = [
  { field: "id", headerName: "Thread ID", width: 120 },
  { field: "ownerId", headerName: "Owner ID", width: 120 },
  { field: "projectId", headerName: "Project ID", width: 120 },
  { field: "contextType", headerName: "Context Type", width: 120 },
  { field: "projectTitle", headerName: "Project Title", width: 220 },
  { field: "projectUploadDate", headerName: "Project Upload Date", width: 180 },
  { field: "firstMessageDate", headerName: "First Message Date", width: 180 },
  { field: "projectBidPrice", headerName: "Project Bid Price", width: 140 },
  {
    field: "projectLink",
    headerName: "Project Link",
    width: 180,
    renderCell: (params) =>
      params.value ? (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          View Project
        </a>
      ) : (
        "N/A"
      ),
  },
  { field: "ownerName", headerName: "Owner Name", width: 160 },
  { field: "ownerLocation", headerName: "Owner Location", width: 180 },
  {
    field: "clientProfileLink",
    headerName: "Client Profile",
    width: 180,
    renderCell: (params) =>
      params.value ? (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          View Profile
        </a>
      ) : (
        "N/A"
      ),
  },
  { field: "bidAmount", headerName: "Your Bid Amount", width: 140 },
  { field: "totalPaid", headerName: "Total Paid (Milestones)", width: 180 },
  { field: "isAwarded", headerName: "Awarded", width: 100 },
  { field: "otherStatus", headerName: "Other Status", width: 140 },
];

function mapThreadsToRows(threads) {
  return threads.map((thread) => {
    const awardStatus = thread.myBid?.award_status || "N/A";
    const isAwarded = ["awarded", "accepted"].includes(awardStatus);
    return {
      id: thread.id,
      ownerId: thread.thread?.owner,
      projectId: thread.thread?.context?.id,
      contextType: thread.thread?.context?.type,
      projectTitle: thread.projectInfo?.title || "N/A",
      projectUploadDate: thread.projectUploadDate || "N/A",
      firstMessageDate: thread.firstMessageDate || "N/A",
      projectBidPrice: thread.bidPrice || "N/A",
      projectLink: thread.projectLink || "",
      ownerName:
        thread.ownerInfo?.public_name || thread.ownerInfo?.username || "N/A",
      ownerLocation:
        (thread.ownerInfo?.location?.city || "N/A") +
        ", " +
        (thread.ownerInfo?.location?.country?.name || ""),
      clientProfileLink: thread.clientProfileLink || "",
      bidAmount: thread.myBid ? `$${thread.myBid.amount}` : "N/A",
      totalPaid:
        thread.totalPaid !== undefined ? `$${thread.totalPaid}` : "N/A",
      isAwarded: isAwarded ? "Yes" : "No",
      otherStatus: isAwarded ? "" : awardStatus,
    };
  });
}

const ThreadsDataGrid = ({ threads, loading }) => (
  <div style={{ height: 500, width: "100%" }}>
    <DataGrid
      rows={mapThreadsToRows(threads)}
      columns={columns}
      loading={loading}
      slots={{
        toolbar: GridToolbar,
      }}
      pageSizeOptions={[5, 10, 25, 50]}
      disableRowSelectionOnClick
      density="compact"
    />
  </div>
);

export default ThreadsDataGrid;
