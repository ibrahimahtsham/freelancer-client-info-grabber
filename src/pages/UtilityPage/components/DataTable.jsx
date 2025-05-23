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
  InputAdornment,
  TextField,
  ButtonGroup,
  Button,
  Tooltip,
  alpha,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
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
    label: "Award Status",
    width: 120,
    format: (value) => {
      if (!value) return <Chip size="small" label="Unknown" color="default" />;

      const status = value.toLowerCase();
      let chipProps = {
        label: value.charAt(0).toUpperCase() + value.slice(1),
        size: "small",
      };

      if (status === "awarded") {
        chipProps.color = "success";
      } else if (status === "pending") {
        chipProps.color = "warning";
      } else if (status === "rejected") {
        chipProps.color = "error";
      } else {
        chipProps.color = "default";
      }

      return <Chip {...chipProps} />;
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
    format: (value, row) => {
      if (value === null || value === undefined) return "$0.00";

      const amount = typeof value !== "number" ? parseFloat(value) || 0 : value;
      const formattedValue = `$${amount.toFixed(2)}`;

      // Color code based on amount relative to bid amount
      let color = "inherit";
      if (row.bid_amount) {
        const ratio = amount / row.bid_amount;
        if (ratio >= 1) {
          color = "success.main"; // Full payment
        } else if (ratio >= 0.5) {
          color = "success.light"; // Significant payment
        } else if (ratio > 0) {
          color = "warning.main"; // Partial payment
        }
      }

      return (
        <Typography sx={{ color, fontWeight: 500 }}>
          {formattedValue}
        </Typography>
      );
    },
  },
  { id: "client_id", label: "Client ID", width: 80 },
  {
    id: "project_type",
    label: "Project Type",
    width: 100,
    format: (value) => {
      if (!value) return "Unknown";
      const type = value.toLowerCase();
      return (
        <Chip
          size="small"
          label={type.charAt(0).toUpperCase() + type.slice(1)}
          color={type === "hourly" ? "primary" : "secondary"}
        />
      );
    },
  },
  {
    id: "recruiter_project",
    label: "Recruiter",
    width: 120,
    format: (value) => (
      <Chip
        size="small"
        label={value ? "Recruiter" : "Non-Recruiter"}
        color={value ? "info" : "default"}
      />
    ),
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

      if (value.length <= 3) {
        return value.map((skill, i) => (
          <Chip key={i} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
        ));
      }

      return (
        <Tooltip title={value.join(", ")}>
          <Box>
            {value.slice(0, 2).map((skill, i) => (
              <Chip
                key={i}
                label={skill}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            <Chip
              label={`+${value.length - 2}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Tooltip>
      );
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
      const hasResponse =
        value === true || (row && row.award_status === "awarded");
      return (
        <Chip
          size="small"
          label={hasResponse ? "Yes" : "No"}
          color={hasResponse ? "success" : "default"}
        />
      );
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
        // Color code based on response time
        let color = "inherit";
        if (value < 3600) {
          // Less than 1 hour
          color = "success.main";
        } else if (value < 86400) {
          // Less than 1 day
          color = "info.main";
        } else {
          color = "warning.main";
        }

        return (
          <Typography sx={{ color }}>{formatTimeFromSeconds(value)}</Typography>
        );
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

      const rating = Number(value);

      // Color-code based on rating
      let color = "inherit";
      if (rating >= 4.5) {
        color = "success.main";
      } else if (rating >= 3.5) {
        color = "info.main";
      } else if (rating >= 2.5) {
        color = "warning.main";
      } else if (rating > 0) {
        color = "error.main";
      }

      return (
        <Typography sx={{ color, fontWeight: 500 }}>
          {rating.toFixed(1)}
        </Typography>
      );
    },
  },
  {
    id: "client_payment_verified",
    label: "Verified",
    width: 80,
    format: (value) => (
      <Chip
        size="small"
        label={value ? "Yes" : "No"}
        color={value ? "success" : "default"}
      />
    ),
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

      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 500 }}>
            {`${value.length} payments - $${total.toFixed(2)}`}
          </Typography>
          <KeyboardArrowDownIcon
            fontSize="small"
            sx={{ ml: 1, opacity: 0.6 }}
          />
        </Box>
      );
    },
  },
  {
    id: "client_verification_status",
    label: "Client Verification",
    width: 140,
    format: (value, row) => {
      // Count verified items
      const verifiedCount = [
        row.client_payment_verified,
        row.client_email_verified,
        row.client_phone_verified,
        row.client_identity_verified,
        row.client_profile_complete,
        row.client_deposit_made,
      ].filter(Boolean).length;

      const totalItems = 6;
      const level =
        verifiedCount < 2 ? "error" : verifiedCount < 4 ? "warning" : "success";

      return (
        <Tooltip
          title={`Payment: ${row.client_payment_verified ? "✓" : "✗"}, 
                        Email: ${row.client_email_verified ? "✓" : "✗"}, 
                        Phone: ${row.client_phone_verified ? "✓" : "✗"}, 
                        Identity: ${row.client_identity_verified ? "✓" : "✗"}, 
                        Profile: ${row.client_profile_complete ? "✓" : "✗"}, 
                        Deposit: ${row.client_deposit_made ? "✓" : "✗"}`}
        >
          <Chip
            size="small"
            label={`${verifiedCount}/${totalItems}`}
            color={level}
          />
        </Tooltip>
      );
    },
  },
  {
    id: "client_experience",
    label: "Client Experience",
    width: 120,
    format: (value, row) => {
      const projectCount = row.client_total_projects || 0;
      let experienceLevel = "New";
      let color = "default";

      if (projectCount > 50) {
        experienceLevel = "Expert";
        color = "success";
      } else if (projectCount > 20) {
        experienceLevel = "Experienced";
        color = "primary";
      } else if (projectCount > 5) {
        experienceLevel = "Intermediate";
        color = "info";
      } else if (projectCount > 0) {
        experienceLevel = "Beginner";
        color = "warning";
      }

      return (
        <Tooltip title={`${projectCount} completed projects`}>
          <Chip size="small" label={experienceLevel} color={color} />
        </Tooltip>
      );
    },
  },
  {
    id: "client_age",
    label: "Account Age",
    width: 120,
    format: (value, row) => {
      if (!row.client_registration_date) return "Unknown";

      const registrationDate = new Date(row.client_registration_date * 1000);
      const now = new Date();
      const diffYears = Math.floor(
        (now - registrationDate) / (1000 * 60 * 60 * 24 * 365)
      );

      return (
        <Tooltip title={`Registered: ${formatDate(registrationDate)}`}>
          <Typography>{diffYears} years</Typography>
        </Tooltip>
      );
    },
  },
  {
    id: "client_company",
    label: "Company",
    width: 150,
    format: (value) => value || "Not specified",
  },
];

// Default visible columns
const DEFAULT_VISIBLE_COLUMNS = [
  "project_title",
  "client_name",
  "bid_amount",
  "bid_time",
  "award_status",
  "paid_amount",
  "project_type",
  "recruiter_project",
  "response_time",
  "client_rating",
  "client_payment_verified",
  "milestone_payments",
];

const DataTable = ({ data = [], title, loading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [orderBy, setOrderBy] = useState("bid_time");
  const [order, setOrder] = useState("desc");
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const handleColumnChange = (newColumns) => {
    setVisibleColumns(newColumns);
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Filter for search
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Handle search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchFields = [
          "project_title",
          "client_name",
          "bid_id",
          "project_id",
        ];

        const matchesSearch = searchFields.some((field) => {
          const value = row[field];
          return value && String(value).toLowerCase().includes(searchLower);
        });

        if (!matchesSearch) return false;
      }

      // Handle status filter
      if (filterStatus !== "all") {
        const status = row.award_status?.toLowerCase() || "";
        if (filterStatus === "awarded" && status !== "awarded") return false;
        if (filterStatus === "pending" && status !== "pending") return false;
        if (filterStatus === "rejected" && status !== "rejected") return false;
      }

      // Handle project type filter
      if (filterType !== "all") {
        const type = row.project_type?.toLowerCase() || "";
        if (filterType === "hourly" && type !== "hourly") return false;
        if (filterType === "fixed" && type !== "fixed") return false;
      }

      return true;
    });
  }, [data, searchTerm, filterStatus, filterType]);

  // Sort and paginate data
  const sortedData = useMemo(() => {
    const compare = (a, b) => {
      if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
      return 0;
    };

    return [...filteredData].sort(compare);
  }, [filteredData, order, orderBy]);

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

  // Download data as CSV
  const downloadCSV = () => {
    // Get visible columns
    const visibleColumnsData = ALL_COLUMNS.filter((col) =>
      visibleColumns.includes(col.id)
    );

    // Create header row
    let csv =
      visibleColumnsData.map((col) => `"${col.label}"`).join(",") + "\n";

    // Add data rows
    sortedData.forEach((row) => {
      const rowData = visibleColumnsData
        .map((col) => {
          let value = row[col.id];

          // For special fields that have formatting, extract the raw value
          if (col.id === "milestone_payments") {
            if (Array.isArray(value) && value.length > 0) {
              const total = value.reduce(
                (sum, m) => sum + parseFloat(m.amount || 0),
                0
              );
              value = `${value.length} payments - $${total.toFixed(2)}`;
            } else {
              value = "No payments";
            }
          } else if (col.id === "client_verification_status" && row) {
            // For client verification status, show the actual verification items
            const verifiedItems = [
              row.client_payment_verified ? "Payment" : null,
              row.client_email_verified ? "Email" : null,
              row.client_phone_verified ? "Phone" : null,
              row.client_identity_verified ? "Identity" : null,
              row.client_profile_complete ? "Profile" : null,
              row.client_deposit_made ? "Deposit" : null,
            ].filter(Boolean);

            value =
              verifiedItems.length > 0 ? verifiedItems.join(", ") : "None";
          } else if (col.id === "client_badges") {
            // For badges, join the array with commas
            value = Array.isArray(value) ? value.join(", ") : "None";
          }

          // Convert arrays to comma-separated strings
          if (Array.isArray(value)) {
            value = value.join(", ");
          }

          // Format dates
          if (col.id.includes("time") && typeof value === "number") {
            try {
              value = formatDate(new Date(value * 1000));
            } catch {
              // Keep as is if formatting fails
            }
          }

          // Prepare value for CSV (wrap in quotes, escape quotes within)
          return `"${String(value || "").replace(/"/g, '""')}"`;
        })
        .join(",");

      csv += rowData + "\n";
    });

    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${title || "data"}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get columns that are currently visible
  const columns = ALL_COLUMNS.filter((col) => visibleColumns.includes(col.id));

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box p={2} display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredData.length} items{" "}
              {filteredData.length !== data.length &&
                `(filtered from ${data.length})`}
            </Typography>
            <ColumnSelector
              availableColumns={ALL_COLUMNS}
              visibleColumns={visibleColumns}
              onChange={handleColumnChange}
            />
            <Tooltip title="Download CSV">
              <IconButton onClick={downloadCSV}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Search by title, client name, or ID..."
            size="small"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0); // Reset to first page on search
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
          />

          <Box display="flex" gap={1}>
            <Box>
              <Typography variant="caption" sx={{ display: "block", ml: 1 }}>
                Award Status
              </Typography>
              <ButtonGroup size="small">
                <Button
                  variant={filterStatus === "all" ? "contained" : "outlined"}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={
                    filterStatus === "awarded" ? "contained" : "outlined"
                  }
                  color="success"
                  onClick={() => setFilterStatus("awarded")}
                >
                  Awarded
                </Button>
                <Button
                  variant={
                    filterStatus === "pending" ? "contained" : "outlined"
                  }
                  color="warning"
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending
                </Button>
              </ButtonGroup>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ display: "block", ml: 1 }}>
                Project Type
              </Typography>
              <ButtonGroup size="small">
                <Button
                  variant={filterType === "all" ? "contained" : "outlined"}
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "hourly" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setFilterType("hourly")}
                >
                  Hourly
                </Button>
                <Button
                  variant={filterType === "fixed" ? "contained" : "outlined"}
                  color="secondary"
                  onClick={() => setFilterType("fixed")}
                >
                  Fixed
                </Button>
              </ButtonGroup>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider />

      <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
        <Table stickyHeader aria-label="data table" size="small">
          <TableHead>
            <TableRow>
              <TableCell width={50} />
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  width={column.width}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={{
                    backgroundColor: "background.paper",
                    fontWeight: "bold",
                  }}
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
              paginatedData.map((row, index) => {
                const isAwarded = row.award_status?.toLowerCase() === "awarded";

                return (
                  <>
                    <TableRow
                      hover
                      key={row.bid_id || index}
                      sx={{
                        "& > *": { borderBottom: "unset" },
                        backgroundColor: isAwarded
                          ? alpha("#4caf50", 0.04)
                          : "inherit",
                        "&:nth-of-type(odd)": {
                          backgroundColor: isAwarded
                            ? alpha("#4caf50", 0.04)
                            : alpha("#f5f5f5", 0.3),
                        },
                      }}
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
                          <TableCell
                            key={column.id}
                            sx={{
                              maxWidth: column.width,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace:
                                column.id === "project_title"
                                  ? "nowrap"
                                  : "normal",
                            }}
                          >
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
                          <Box
                            sx={{
                              margin: 2,
                              backgroundColor: alpha("#f5f5f5", 0.3),
                              borderRadius: 1,
                              p: 2,
                            }}
                          >
                            <Typography
                              variant="h6"
                              gutterBottom
                              component="div"
                            >
                              Milestone Payments - {row.project_title}
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
                                        bgcolor: (theme) =>
                                          payment.status === "cleared"
                                            ? alpha(
                                                theme.palette.success.main,
                                                0.1
                                              )
                                            : alpha(
                                                theme.palette.grey[500],
                                                0.1
                                              ),
                                        boxShadow: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        sx={{
                                          fontWeight: "bold",
                                          color: "success.dark",
                                        }}
                                      >
                                        ${parseFloat(payment.amount).toFixed(2)}
                                      </Typography>

                                      <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mt={1}
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
                                          sx={{
                                            p: 1,
                                            borderLeft: "3px solid",
                                            borderColor: "divider",
                                            backgroundColor: alpha(
                                              "#f5f5f5",
                                              0.5
                                            ),
                                            borderRadius: "0 4px 4px 0",
                                          }}
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No milestone payments found for this bid.
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DataTable;
