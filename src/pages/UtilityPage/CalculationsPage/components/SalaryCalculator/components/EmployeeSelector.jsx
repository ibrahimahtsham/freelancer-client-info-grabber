import {
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Avatar,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const EmployeeSelector = ({
  employees,
  selectedEmployeeId,
  setSelectedEmployeeId,
  formatShiftTime,
}) => {
  return (
    <Card
      sx={{ mb: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Team Member Selection
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {employees.map((emp) => (
          <Box
            key={emp.id}
            onClick={() => setSelectedEmployeeId(emp.id)}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1.5,
              mb: 1,
              borderRadius: 2,
              cursor: "pointer",
              bgcolor:
                selectedEmployeeId === emp.id
                  ? `${emp.color}15`
                  : "transparent",
              border:
                selectedEmployeeId === emp.id
                  ? `1px solid ${emp.color}`
                  : "1px solid transparent",
              "&:hover": {
                bgcolor: `${emp.color}10`,
              },
            }}
          >
            <Radio
              checked={selectedEmployeeId === emp.id}
              onChange={() => setSelectedEmployeeId(emp.id)}
              sx={{
                color: emp.color,
                "&.Mui-checked": {
                  color: emp.color,
                },
              }}
            />
            <Avatar
              sx={{
                bgcolor: emp.color,
                width: 36,
                height: 36,
                fontSize: "1rem",
                mr: 1.5,
              }}
            >
              {emp.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="body1"
                sx={{ fontWeight: selectedEmployeeId === emp.id ? 500 : 400 }}
              >
                {emp.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccessTimeIcon
                  sx={{ fontSize: "0.9rem", mr: 0.5, color: "text.secondary" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {formatShiftTime(emp)}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default EmployeeSelector;
