import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const DetailsModal = ({ open, onClose, details = {} }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      Additional Client, Project, and Thread Details
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      {Object.entries(details).length === 0 ? (
        <Typography>No details available.</Typography>
      ) : (
        Object.entries(details).map(([key, value]) => (
          <Typography key={key} variant="body2" sx={{ mb: 1 }}>
            <strong>{key}:</strong> {String(value)}
          </Typography>
        ))
      )}
    </DialogContent>
  </Dialog>
);

export default DetailsModal;
