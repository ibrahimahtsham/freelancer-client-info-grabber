import { useState } from "react";
import {
  TableRow,
  TableCell,
  Collapse,
  IconButton,
  alpha,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MilestoneSection from "./MilestoneSection";

const DataTableRow = ({ row, columns, selectedRow, onClick }) => {
  const [expanded, setExpanded] = useState(false);

  const isAwarded = row.award_status?.toLowerCase() === "awarded";
  const isSelected = selectedRow === row.bid_id;
  const hasMilestones =
    row.milestone_payments && row.milestone_payments.length > 0;

  return (
    <>
      <TableRow
        hover
        sx={{
          "& > *": { borderBottom: "unset" },
          backgroundColor: isSelected
            ? alpha("#2196f3", 0.08)
            : isAwarded
            ? alpha("#4caf50", 0.04)
            : "inherit",
          "&:nth-of-type(odd)": {
            backgroundColor: isSelected
              ? alpha("#2196f3", 0.08)
              : isAwarded
              ? alpha("#4caf50", 0.04)
              : alpha("#f5f5f5", 0.3),
          },
          cursor: "pointer",
        }}
        onClick={() => onClick(row.bid_id)}
        selected={isSelected}
      >
        <TableCell>
          {hasMilestones ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row selection
                setExpanded(!expanded);
              }}
            >
              {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
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
                whiteSpace: column.id === "project_title" ? "nowrap" : "normal",
              }}
            >
              {column.format ? column.format(value, row) : value}
            </TableCell>
          );
        })}
      </TableRow>

      {/* Expandable milestone section */}
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={columns.length + 1}
        >
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <MilestoneSection
              projectTitle={row.project_title}
              milestonePayments={row.milestone_payments}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default DataTableRow;
