import { Box, Button, Typography, Divider } from "@mui/material";
import Paper from "@mui/material/Paper";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const ActionButtonsSection = ({ employee, onCancel, sectionStyle, theme }) => {
  return (
    <Paper elevation={1} sx={sectionStyle}>
      {/* Top half - Add/Update Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "50%",
          pb: 2,
        }}
      >
        <Typography
          variant="h6"
          color={employee ? "primary.main" : "success.main"}
          sx={{ mb: 3, fontWeight: 500 }}
        >
          {employee ? "Update Employee" : "Add New Employee"}
        </Typography>

        <Button
          type="submit"
          variant="contained"
          color={employee ? "primary" : "success"}
          startIcon={<SaveIcon />}
          size="large"
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            fontWeight: 500,
            fontSize: "1rem",
            "&:hover": {
              boxShadow: theme.shadows[5],
            },
          }}
        >
          {employee ? "Update" : "Add Employee"}
        </Button>
      </Box>

      <Divider sx={{ borderStyle: "dashed" }} />

      {/* Bottom half - Cancel Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "50%",
          pt: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Cancel this operation and return to previous view
        </Typography>

        <Button
          variant="outlined"
          onClick={onCancel}
          startIcon={<CancelIcon />}
          size="large"
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>
      </Box>
    </Paper>
  );
};

export default ActionButtonsSection;
