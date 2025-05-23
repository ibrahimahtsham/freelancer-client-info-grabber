import { Box, Typography, ButtonGroup, Button } from "@mui/material";

const TableFilters = ({
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
}) => {
  return (
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
            variant={filterStatus === "awarded" ? "contained" : "outlined"}
            color="success"
            onClick={() => setFilterStatus("awarded")}
          >
            Awarded
          </Button>
          <Button
            variant={filterStatus === "pending" ? "contained" : "outlined"}
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
  );
};

export default TableFilters;
