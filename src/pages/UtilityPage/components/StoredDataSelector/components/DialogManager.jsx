import DeleteDialog from "./DeleteDialog";
import ClearAllDialog from "./ClearAllDialog";

const DialogManager = ({
  deleteDialogOpen,
  clearAllDialogOpen,
  onDeleteCancel,
  onDeleteConfirm,
  onClearAllClose,
  onClearAllConfirm,
}) => {
  return (
    <>
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        onConfirm={onDeleteConfirm}
      />
      <ClearAllDialog
        open={clearAllDialogOpen}
        onClose={onClearAllClose}
        onConfirm={onClearAllConfirm}
      />
    </>
  );
};

export default DialogManager;
