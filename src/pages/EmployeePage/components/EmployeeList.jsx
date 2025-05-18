import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";

const EmployeeList = ({ employees, onEdit, onDelete }) => {
  if (!employees.length) {
    return <Typography>No employees found.</Typography>;
  }

  return (
    <List>
      {employees.map((employee, index) => (
        <Box key={employee.id}>
          {index > 0 && <Divider />}
          <ListItem>
            <ListItemAvatar>
              <Avatar style={{ backgroundColor: employee.color }}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={employee.name}
              secondary={`Shift: ${employee.startHour}${employee.startAmPm} - ${employee.endHour}${employee.endAmPm}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => onEdit(employee)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => onDelete(employee.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </Box>
      ))}
    </List>
  );
};

export default EmployeeList;
