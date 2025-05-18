import React from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

const EmployeeList = ({ employees, onEdit, onDelete }) => {
  const theme = useTheme();

  if (!employees.length) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          color: "text.secondary",
        }}
      >
        <PersonIcon sx={{ fontSize: 60 }} />
        <Typography variant="h6" color="inherit">
          No team members yet
        </Typography>
        <Typography variant="body2" color="inherit">
          Add your first employee to get started
        </Typography>
      </Box>
    );
  }

  // Format shift time to be more readable
  const formatShiftTime = (startHour, startAmPm, endHour, endAmPm) => {
    return `${startHour}:00 ${startAmPm} - ${endHour}:00 ${endAmPm}`;
  };

  return (
    <Stack spacing={2}>
      {employees.map((employee) => (
        <Paper
          key={employee.id}
          elevation={1}
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            transition:
              "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: theme.shadows[4],
            },
            position: "relative",
          }}
        >
          {/* Color accent bar */}
          <Box
            sx={{
              height: "6px",
              backgroundColor: employee.color,
              width: "100%",
            }}
          />

          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Employee info */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: employee.color,
                  color: theme.palette.getContrastText(employee.color),
                  width: 50,
                  height: 50,
                  mr: 2,
                }}
              >
                {employee.name.charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {employee.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AccessTimeIcon
                    sx={{
                      mr: 0.5,
                      fontSize: "0.875rem",
                      color: "text.secondary",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatShiftTime(
                      employee.startHour,
                      employee.startAmPm,
                      employee.endHour,
                      employee.endAmPm
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Status and actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label="Active"
                size="small"
                sx={{
                  bgcolor: alpha(employee.color, 0.1),
                  color: employee.color,
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: `1px solid ${alpha(employee.color, 0.3)}`,
                }}
              />

              <Box sx={{ display: "flex" }}>
                <Tooltip title="Edit">
                  <IconButton
                    onClick={() => onEdit(employee)}
                    size="small"
                    sx={{
                      color: theme.palette.primary.main,
                      "&:hover": {
                        bgcolor:
                          theme.palette.primary.lighter ||
                          alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
                  <IconButton
                    onClick={() => onDelete(employee.id)}
                    size="small"
                    sx={{
                      color: theme.palette.error.main,
                      "&:hover": {
                        bgcolor:
                          theme.palette.error.lighter ||
                          alpha(theme.palette.error.main, 0.1),
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
};

export default EmployeeList;
