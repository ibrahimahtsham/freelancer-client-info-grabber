import { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  Chip,
  Tooltip,
  Link,
  CircularProgress,
} from "@mui/material";
import { formatEpochToPakistanTime } from "../../../utils/dateUtils";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";

// Helper functions
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a, b, propertyPath) {
  // Handle nested properties using path
  const getNestedValue = (obj, path) => {
    const props = path.split(".");
    let value = obj;
    for (const prop of props) {
      value = value?.[prop] ?? null;
    }
    return value;
  };

  const valA = getNestedValue(a, propertyPath);
  const valB = getNestedValue(b, propertyPath);

  // Handle null/undefined values
  if (valB === null || valB === undefined) return -1;
  if (valA === null || valA === undefined) return 1;

  if (typeof valA === "string" && typeof valB === "string") {
    return valB.localeCompare(valA);
  }

  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

// Define all needed columns
const columns = [
  { id: "bid_id", label: "Bid ID", sortable: true },
  {
    id: "project_title",
    label: "Project",
    sortable: true,
    render: (row) => (
      <Tooltip title="View project details">
        <Link href={row.project_url} target="_blank" rel="noopener">
          {row.project_title || "N/A"}
        </Link>
      </Tooltip>
    ),
  },
  {
    id: "client_name",
    label: "Client",
    sortable: true,
    render: (row) => (
      <Tooltip title={`View client profile: ${row.client_name}`}>
        <Link href={row.client_url} target="_blank" rel="noopener">
          {row.client_name || "N/A"}
        </Link>
      </Tooltip>
    ),
  },
  {
    id: "bid_amount",
    label: "Bid",
    sortable: true,
    render: (row) => `$${row.bid_amount?.toFixed(2) || "0.00"}`,
  },
  {
    id: "bid_time",
    label: "Bid Time",
    sortable: true,
    render: (row) => formatEpochToPakistanTime(row.bid_time),
  },
  {
    id: "award_status",
    label: "Status",
    sortable: true,
    render: (row) => {
      let color;
      switch (row.award_status) {
        case "awarded":
          color = "success";
          break;
        case "pending":
          color = "info";
          break;
        case "rejected":
          color = "error";
          break;
        default:
          color = "default";
      }
      return (
        <Chip size="small" label={row.award_status || "N/A"} color={color} />
      );
    },
  },
  {
    id: "paid_amount",
    label: "Paid",
    sortable: true,
    render: (row) => `$${row.paid_amount?.toFixed(2) || "0.00"}`,
  },
  // Project-specific fields
  {
    id: "project_type",
    label: "Type",
    sortable: true,
    render: (row) =>
      row.project_type === "hourly" ? (
        <Chip size="small" label="Hourly" color="primary" />
      ) : (
        <Chip size="small" label="Fixed" color="secondary" />
      ),
  },
  {
    id: "skills",
    label: "Skills",
    sortable: false,
    render: (row) => (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {(row.skills || []).slice(0, 3).map((skill, idx) => (
          <Chip key={idx} size="small" label={skill} variant="outlined" />
        ))}
        {(row.skills || []).length > 3 && (
          <Tooltip title={(row.skills || []).slice(3).join(", ")}>
            <Chip size="small" label={`+${row.skills.length - 3}`} />
          </Tooltip>
        )}
      </Box>
    ),
  },
  {
    id: "budget_range",
    label: "Budget",
    sortable: true,
    render: (row) => {
      if (!row.min_budget && !row.max_budget) return "N/A";
      if (row.min_budget && row.max_budget) {
        return `$${row.min_budget}-$${row.max_budget}`;
      }
      return `$${row.min_budget || row.max_budget}`;
    },
  },
  {
    id: "total_bids",
    label: "Bids",
    sortable: true,
    render: (row) => row.total_bids || "N/A",
  },
  {
    id: "received_response",
    label: "Response",
    sortable: true,
    render: (row) => {
      const received = row.received_response;
      return received ? (
        <Chip size="small" label="Received" color="success" />
      ) : (
        <Chip size="small" label="No Response" color="default" />
      );
    },
  },
  {
    id: "response_time",
    label: "Response Time",
    sortable: true,
    render: (row) => {
      if (!row.response_time) return "N/A";

      // Format response time (in seconds) to readable format
      const hours = Math.floor(row.response_time / 3600);
      const minutes = Math.floor((row.response_time % 3600) / 60);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      }

      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    },
  },
  // Client fields
  {
    id: "client_country",
    label: "Country",
    sortable: true,
    render: (row) => row.client_country || "Unknown",
  },
  {
    id: "client_rating",
    label: "Rating",
    sortable: true,
    render: (row) => {
      if (!row.client_rating) return "N/A";
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography>{row.client_rating.toFixed(1)}</Typography>
          <StarIcon sx={{ color: "gold", fontSize: "1rem", ml: 0.5 }} />
        </Box>
      );
    },
  },
  {
    id: "client_payment_verified",
    label: "Verified",
    sortable: true,
    render: (row) =>
      row.client_payment_verified ? (
        <Chip
          size="small"
          icon={<VerifiedIcon />}
          label="Verified"
          color="success"
        />
      ) : (
        <Chip size="small" label="Not Verified" color="default" />
      ),
  },
];

const DataTable = ({ rows = [], loading = false }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("bid_time");

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle page changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page changes
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Memoize sorting and pagination to avoid unnecessary re-renders
  const sortedRows = useMemo(() => {
    if (!rows.length) return [];

    return [...rows]
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, order, orderBy, page, rowsPerPage]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rows.length) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 650 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.map((row, index) => (
              <TableRow hover key={row.bid_id || index}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.render
                      ? column.render(row)
                      : row[column.id] !== undefined
                      ? String(row[column.id])
                      : "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DataTable;
