import {
  Modal,
  Fade,
  Paper,
  Typography,
  IconButton,
  Box,
  Button,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ChromePicker } from "react-color";

const ColorPickerModal = ({ open, onClose, color, onColorChange }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Fade in={open}>
        <Paper
          elevation={4}
          sx={{
            width: "auto",
            maxWidth: 320,
            p: 3,
            position: "relative",
            borderRadius: 2,
          }}
        >
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
            Choose Employee Color
          </Typography>

          <ChromePicker
            color={color}
            onChangeComplete={onColorChange}
            disableAlpha
            styles={{
              default: {
                picker: {
                  width: "100%",
                  boxShadow: "none",
                },
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  bgcolor: color,
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                  mr: 1,
                }}
              />
              <Typography variant="body2" fontWeight={500}>
                {color.toUpperCase()}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={onClose}
              sx={{
                bgcolor: color,
                "&:hover": {
                  bgcolor: alpha(color, 0.8),
                },
              }}
            >
              Apply Color
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default ColorPickerModal;
