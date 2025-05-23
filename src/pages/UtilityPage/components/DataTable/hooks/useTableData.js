import { useState, useMemo } from "react";

/**
 * Custom hook for handling table data operations
 * @param {Array} data - Raw data array
 * @param {Object} options - Additional options
 * @returns {Object} - Table data functions and state
 */
export default function useTableData(data, options = {}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    options.defaultRowsPerPage || 25
  );
  const [orderBy, setOrderBy] = useState(options.defaultOrderBy || "bid_time");
  const [order, setOrder] = useState(options.defaultOrder || "desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedRow, setSelectedRow] = useState(null);

  // Filter for search and other filters
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

  // Sort data
  const sortedData = useMemo(() => {
    const compare = (a, b) => {
      if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
      return 0;
    };

    return [...filteredData].sort(compare);
  }, [filteredData, order, orderBy]);

  // Paginate data
  const paginatedData = useMemo(() => {
    return sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedData, page, rowsPerPage]);

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle row selection
  const handleRowClick = (rowId) => {
    setSelectedRow(rowId === selectedRow ? null : rowId);
  };

  return {
    page,
    rowsPerPage,
    orderBy,
    order,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    selectedRow,
    setSelectedRow,
    filteredData,
    sortedData,
    paginatedData,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    handleRowClick,
  };
}
