import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CodeIcon from "@mui/icons-material/Code";
import ColumnSelector from "../../ColumnSelector";

const TableToolbar = ({
  title,
  data,
  filteredData,
  searchTerm,
  setSearchTerm,
  visibleColumns,
  availableColumns,
  onColumnChange,
  onDownloadCSV,
  selectedRow,
  onLogRowData,
}) => {
  return (
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
            availableColumns={availableColumns}
            visibleColumns={visibleColumns}
            onChange={onColumnChange}
          />
          <Tooltip
            title={selectedRow ? "Log Selected Row Data" : "Select a row first"}
          >
            <span>
              <IconButton
                onClick={onLogRowData}
                disabled={!selectedRow}
                color={selectedRow ? "primary" : "default"}
              >
                <CodeIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Download CSV">
            <IconButton onClick={onDownloadCSV}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search field */}
      <TextField
        placeholder="Search by title, client name, or ID..."
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 300, flexGrow: 1 }}
      />
    </Box>
  );
};

export default TableToolbar;
