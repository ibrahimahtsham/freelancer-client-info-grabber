import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Chip,
  Card,
  alpha,
  useTheme,
  Zoom,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

const EmployeeList = ({ employees, onEdit, onDelete }) => {
  const theme = useTheme();

  if (!employees.length) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No employees found. Add your first team member!
        </Typography>
      </Box>
    );
  }

  // Format time to be more readable
  const formatTime = (hour, ampm) => `${hour}${ampm}`;

  return (
    <List sx={{ width: "100%" }}>
      {employees.map((employee, index) => (
        <Zoom
          in={true}
          key={employee.id}
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          <Box sx={{ mb: 2 }}>
            <Card
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(employee.color, 0.3)}`,
                boxShadow: `0 2px 8px ${alpha(employee.color, 0.15)}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px ${alpha(employee.color, 0.25)}`,
                },
                position: "relative",
                pr: 10,
              }}
            >
              <ListItem>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: employee.color,
                      width: 45,
                      height: 45,
                      boxShadow: theme.shadows[3],
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      component="span"
                      fontWeight="500"
                    >
                      {employee.name}
                    </Typography>
                  }
                  secondary={
                    <Box
                      sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                    >
                      <AccessTimeIcon
                        sx={{
                          mr: 0.5,
                          fontSize: "0.875rem",
                          color: "text.secondary",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(employee.startHour, employee.startAmPm)} -{" "}
                        {formatTime(employee.endHour, employee.endAmPm)}
                      </Typography>
                    </Box>
                  }
                />

                {/* Added increased margin-right to create more space from buttons */}
                <Box sx={{ display: "flex", alignItems: "center", mr: 12 }}>
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      bgcolor: alpha(employee.color, 0.1),
                      color: employee.color,
                      fontWeight: 500,
                      border: `1px solid ${alpha(employee.color, 0.3)}`,
                    }}
                  />
                </Box>

                <ListItemSecondaryAction sx={{ right: 16 }}>
                  <Tooltip title="Edit employee">
                    <IconButton
                      onClick={() => onEdit(employee)}
                      sx={{
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        mr: 1,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete employee">
                    <IconButton
                      onClick={() => onDelete(employee.id)}
                      sx={{
                        color: theme.palette.error.main,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.error.main, 0.2),
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            </Card>
          </Box>
        </Zoom>
      ))}
    </List>
  );
};

export default EmployeeList;
