import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  Box,
  Typography,
  Chip,
  Tooltip,
  Link,
} from "@mui/material";
import { formatDate } from "../../../utils/dateUtils";
import ColumnSelector from "./ColumnSelector";

// Define all your columns here
const ALL_COLUMNS = [
  { id: "bid_id", label: "Bid ID", width: 80 },
  { id: "project_title", label: "Project Title", width: 200 },
  { id: "client_name", label: "Client", width: 120 },
  {
    id: "bid_amount",
    label: "Bid Amount",
    width: 100,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
  {
    id: "bid_time",
    label: "Bid Date",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      try {
        // If it's a number (timestamp in seconds), convert to milliseconds
        if (typeof value === "number") {
          return formatDate(new Date(value * 1000));
        }
        // If it's already a Date object
        if (value instanceof Date) {
          return formatDate(value);
        }
        // If it's a string, try to parse it
        return formatDate(new Date(value));
      } catch (error) {
        console.warn("Failed to format date:", value, error);
        return "Invalid date";
      }
    },
  },
  { id: "award_status", label: "Status", width: 100 },
  {
    id: "paid_amount",
    label: "Paid",
    width: 100,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
  { id: "project_type", label: "Type", width: 80 },
  {
    id: "skills",
    label: "Skills",
    width: 200,
    format: (value) => {
      if (!value) return "";
      if (!Array.isArray(value)) return String(value);
      return value.join(", ");
    },
  },
  { id: "total_bids", label: "Total Bids", width: 100 },
  {
    id: "received_response",
    label: "Response",
    width: 100,
    format: (value) => (value === true ? "Yes" : "No"),
  },
  {
    id: "response_time",
    label: "Response Time",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      const hours = Math.floor(value / 3600);
      const days = Math.floor(hours / 24);
      return days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;
    },
  },
  { id: "client_country", label: "Country", width: 120 },
  { id: "client_rating", label: "Rating", width: 80 },
  {
    id: "client_payment_verified",
    label: "Verified",
    width: 80,
    format: (value) => (value ? "Yes" : "No"),
  },
  // Add more columns as needed
];

// Allow users to select which columns to display
const DEFAULT_VISIBLE_COLUMNS = [
  "bid_id",
  "project_title",
  "client_name",
  "bid_amount",
  "bid_time",
  "award_status",
  "paid_amount",
  "project_type",
  "skills",
  "total_bids",
  "received_response",
  "response_time",
  "client_country",
  "client_rating",
  "client_payment_verified",
];

const DataTable = ({ data = [], title, loading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [orderBy, setOrderBy] = useState("bid_time");
  const [order, setOrder] = useState("desc");
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);

  const handleColumnChange = (newColumns) => {
    setVisibleColumns(newColumns);
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort and paginate data
  const sortedData = useMemo(() => {
    const compare = (a, b) => {
      if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
      return 0;
    };

    return [...data].sort(compare);
  }, [data, order, orderBy]);

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get columns that are currently visible
  const columns = ALL_COLUMNS.filter((col) => visibleColumns.includes(col.id));

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box
        p={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <ColumnSelector
            availableColumns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={handleColumnChange}
          />
          <Typography variant="body2" color="text.secondary">
            {data.length} items
          </Typography>
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
        <Table stickyHeader aria-label="data table" size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  width={column.width}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : "asc"}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data to display
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow hover key={row.bid_id}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DataTable;
