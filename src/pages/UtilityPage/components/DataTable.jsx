import { useState, useMemo } from "react";
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
  Link,
  Collapse,
  IconButton,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { formatDate } from "../../../utils/dateUtils";
import ColumnSelector from "./ColumnSelector";

// Define all your columns here
const ALL_COLUMNS = [
  { id: "bid_id", label: "Bid ID", width: 80 },
  { id: "project_id", label: "Project ID", width: 80 },
  { id: "project_title", label: "Project Title", width: 200 },
  {
    id: "project_url",
    label: "Project URL",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      return (
        <Link href={value} target="_blank" rel="noopener noreferrer">
          View Project
        </Link>
      );
    },
  },
  {
    id: "project_created",
    label: "Project Created",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      try {
        if (typeof value === "number") {
          return formatDate(new Date(value * 1000));
        }
        if (value instanceof Date) {
          return formatDate(value);
        }
        return formatDate(new Date(value));
      } catch {
        return "Invalid date";
      }
    },
  },
  { id: "client_name", label: "Client", width: 120 },
  {
    id: "client_url",
    label: "Client URL",
    width: 100,
    format: (value) => {
      if (!value) return "N/A";
      return (
        <Link href={value} target="_blank" rel="noopener noreferrer">
          View Profile
        </Link>
      );
    },
  },
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
        if (typeof value === "number") {
          return formatDate(new Date(value * 1000));
        }
        if (value instanceof Date) {
          return formatDate(value);
        }
        return formatDate(new Date(value));
      } catch (error) {
        console.warn("Failed to format date:", value, error);
        return "Invalid date";
      }
    },
  },
  {
    id: "award_status",
    label: "Status",
    width: 100,
    format: (value) => {
      if (!value) return "N/A";
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
  {
    id: "awarded_time",
    label: "Awarded Time",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      try {
        if (typeof value === "number") {
          return formatDate(new Date(value * 1000));
        }
        if (value instanceof Date) {
          return formatDate(value);
        }
        return formatDate(new Date(value));
      } catch {
        return "Invalid date";
      }
    },
  },
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
  { id: "client_id", label: "Client ID", width: 80 },
  { id: "project_type", label: "Type", width: 80 },
  {
    id: "recruiter_project",
    label: "Hireme",
    width: 80,
    format: (value) => (value ? "Yes" : "No"),
  },
  {
    id: "min_budget",
    label: "Min Budget",
    width: 100,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
  {
    id: "max_budget",
    label: "Max Budget",
    width: 100,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
  { id: "total_bids", label: "Total Bids", width: 100 },
  {
    id: "avg_bid",
    label: "Avg Bid",
    width: 100,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
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
  {
    id: "bid_proposal_link",
    label: "Proposal",
    width: 100,
    format: (value) => {
      if (!value) return "N/A";
      return (
        <Link href={value} target="_blank" rel="noopener noreferrer">
          View Proposal
        </Link>
      );
    },
  },
  {
    id: "received_response",
    label: "Response",
    width: 100,
    format: (value, row) => {
      // Consider awarded status as a response
      if (value === true || (row && row.award_status === "awarded")) {
        return "Yes";
      }
      return "No";
    },
  },
  {
    id: "response_time",
    label: "Response Time",
    width: 120,
    format: (value, row) => {
      // Helper function to format seconds into readable time
      const formatTimeFromSeconds = (seconds) => {
        if (seconds <= 0) return "0s";

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (days > 0) {
          return `${days}d ${hours}h ${minutes}m ${secs}s`;
        } else if (hours > 0) {
          return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
          return `${minutes}m ${secs}s`;
        } else {
          return `${secs}s`;
        }
      };

      // If explicitly has a value, use it
      if (value) {
        return formatTimeFromSeconds(value);
      }

      // If awarded but no response time, calculate from awarded_time and bid_time if available
      if (row && row.award_status === "awarded") {
        if (row.awarded_time && row.bid_time) {
          const awardedTime =
            typeof row.awarded_time === "number"
              ? row.awarded_time
              : new Date(row.awarded_time).getTime() / 1000;
          const bidTime =
            typeof row.bid_time === "number"
              ? row.bid_time
              : new Date(row.bid_time).getTime() / 1000;

          const diffSeconds = awardedTime - bidTime;
          if (diffSeconds > 0) {
            return formatTimeFromSeconds(diffSeconds);
          }
        }
        return "Awarded"; // If we can't calculate but it's awarded
      }

      return "N/A";
    },
  },
  {
    id: "first_message_time",
    label: "First Message",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      try {
        if (typeof value === "number") {
          return formatDate(new Date(value * 1000));
        }
        if (value instanceof Date) {
          return formatDate(value);
        }
        return formatDate(new Date(value));
      } catch {
        return "Invalid date";
      }
    },
  },
  { id: "client_country", label: "Country", width: 120 },
  {
    id: "client_rating",
    label: "Rating",
    width: 80,
    format: (value) => {
      if (value === null || value === undefined) return "N/A";
      return Number(value).toFixed(1);
    },
  },
  {
    id: "client_payment_verified",
    label: "Verified",
    width: 80,
    format: (value) => (value ? "Yes" : "No"),
  },
  {
    id: "milestones",
    label: "Milestones",
    width: 150,
    format: (value) => {
      if (!value || !Array.isArray(value) || value.length === 0) return "None";
      return `${value.length} milestone(s)`;
    },
  },
  {
    id: "total_milestone_amount",
    label: "Milestone Total",
    width: 120,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
  {
    id: "milestone_payments",
    label: "Milestone Payments",
    width: 180,
    format: (value) => {
      // If no milestone payments or empty array
      if (!value || !Array.isArray(value) || value.length === 0) {
        return "No payments";
      }

      // Calculate the total amount
      const total = value.reduce(
        (sum, m) => sum + parseFloat(m.amount || 0),
        0
      );

      return `${value.length} payments - $${total.toFixed(2)}`;
    },
  },
];

// Updated to include all columns from the requirements
const DEFAULT_VISIBLE_COLUMNS = [
  "bid_id",
  "project_id",
  "project_title",
  "project_url",
  "project_created",
  "client_name",
  "client_url",
  "bid_amount",
  "bid_time",
  "award_status",
  "awarded_time",
  "paid_amount",
  "project_type",
  "recruiter_project",
  "min_budget",
  "max_budget",
  "total_bids",
  "avg_bid",
  "skills",
  "bid_proposal_link",
  "received_response",
  "response_time",
  "first_message_time",
  "client_country",
  "client_rating",
  "client_payment_verified",
  "milestones",
  "total_milestone_amount",
  "milestone_payments",
];

const DataTable = ({ data = [], title, loading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [orderBy, setOrderBy] = useState("bid_time");
  const [order, setOrder] = useState("desc");
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [expandedRow, setExpandedRow] = useState(null);

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
              <TableCell width={50} />
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
                <TableCell colSpan={columns.length + 1} align="center">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  No data to display
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <>
                  <TableRow
                    hover
                    key={row.bid_id}
                    sx={{ "& > *": { borderBottom: "unset" } }}
                  >
                    <TableCell>
                      {row.milestone_payments &&
                      row.milestone_payments.length > 0 ? (
                        <IconButton
                          size="small"
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === row.bid_id ? null : row.bid_id
                            )
                          }
                        >
                          {expandedRow === row.bid_id ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      ) : null}
                    </TableCell>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={columns.length + 1}
                    >
                      <Collapse
                        in={expandedRow === row.bid_id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Milestone Payments
                          </Typography>

                          <Grid container spacing={2}>
                            {row.milestone_payments &&
                              row.milestone_payments.map((payment, index) => (
                                <Grid item xs={12} md={6} lg={4} key={index}>
                                  <Box
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1,
                                      p: 2,
                                      mb: 1,
                                      bgcolor:
                                        payment.status === "cleared"
                                          ? "success.50"
                                          : "grey.50",
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontWeight: "bold" }}
                                    >
                                      ${parseFloat(payment.amount).toFixed(2)}
                                    </Typography>

                                    <Box
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="center"
                                    >
                                      <Typography variant="body2">
                                        {payment.formatted_date ||
                                          formatDate(
                                            new Date(payment.date * 1000)
                                          )}
                                      </Typography>
                                      <Chip
                                        size="small"
                                        label={payment.status}
                                        color={
                                          payment.status === "cleared"
                                            ? "success"
                                            : "default"
                                        }
                                      />
                                    </Box>

                                    {payment.reason && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mt={1}
                                      >
                                        {payment.reason}
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>
                              ))}
                          </Grid>

                          {(!row.milestone_payments ||
                            row.milestone_payments.length === 0) && (
                            <Typography variant="body2" color="text.secondary">
                              No milestone payments found for this bid.
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
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
