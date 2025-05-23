import { TableHead, TableRow, TableCell, TableSortLabel } from "@mui/material";

const TableHeader = ({ columns, orderBy, order, onRequestSort }) => {
  return (
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
              onClick={() => onRequestSort(column.id)}
            >
              {column.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
