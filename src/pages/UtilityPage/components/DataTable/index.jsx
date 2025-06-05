import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
  Box,
  Divider,
} from "@mui/material";

// Import components
import TableToolbar from "./components/TableToolbar";
import TableFilters from "./components/TableFilters";
import TableHeader from "./components/TableHeader";
import DataTableRow from "./components/DataTableRow";

// Import utils and hooks
import { ALL_COLUMNS, DEFAULT_VISIBLE_COLUMNS } from "./utils/columnDefs";
import { downloadCSV, downloadJSON } from "./utils/exportUtils";
import useTableData from "./hooks/useTableData";

const DataTable = ({ data = [], title, loading }) => {
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);

  // Use the custom hook for table data operations
  const {
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
    filteredData,
    sortedData,
    paginatedData,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    handleRowClick,
  } = useTableData(data);

  // Handle visible columns change
  const handleColumnChange = (newColumns) => {
    setVisibleColumns(newColumns);
  };

  // Log selected row data
  const logRowData = () => {
    if (selectedRow) {
      const rowData = data.find((row) => row.bid_id === selectedRow);
      if (rowData) {
        console.log("Raw row data:", JSON.stringify(rowData, null, 2));
      }
    }
  };

  // Handle CSV download
  const handleDownloadCSV = () => {
    downloadCSV(sortedData, visibleColumns, title);
  };

  // Handle JSON download
  const handleDownloadJSON = () => {
    downloadJSON(sortedData, {}, title);
  };

  // Get columns that are currently visible
  const columns = ALL_COLUMNS.filter((col) => visibleColumns.includes(col.id));

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {/* Toolbar with search and actions */}
      <TableToolbar
        title={title}
        data={data}
        filteredData={filteredData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        visibleColumns={visibleColumns}
        availableColumns={ALL_COLUMNS}
        onColumnChange={handleColumnChange}
        onDownloadCSV={handleDownloadCSV}
        onDownloadJSON={handleDownloadJSON}
        selectedRow={selectedRow}
        onLogRowData={logRowData}
      />

      {/* Filters section */}
      <Box p={2} display="flex" gap={2} flexWrap="wrap">
        <TableFilters
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterType={filterType}
          setFilterType={setFilterType}
        />
      </Box>

      <Divider />

      {/* Table */}
      <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
        <Table stickyHeader aria-label="data table" size="small">
          <TableHeader
            columns={columns}
            orderBy={orderBy}
            order={order}
            onRequestSort={handleRequestSort}
          />

          <TableBody>
            {loading ? (
              <TableCell colSpan={columns.length + 1} align="center">
                Loading data...
              </TableCell>
            ) : paginatedData.length === 0 ? (
              <TableCell colSpan={columns.length + 1} align="center">
                No data to display
              </TableCell>
            ) : (
              paginatedData.map((row, index) => (
                <DataTableRow
                  key={row.bid_id || index}
                  row={row}
                  columns={columns}
                  selectedRow={selectedRow}
                  onClick={handleRowClick}
                  index={index}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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
