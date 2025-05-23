import { useCallback } from "react";

export function useSaveDataset(props) {
  const {
    rows,
    saveData,
    fetchControls,
    refreshStoredDatasets,
    setNameDialogOpen,
    setDatasetName,
    setSnackbar,
    datasetName,
  } = props;

  const { fromDate, toDate, limitEnabled, limit, fetchType } = fetchControls;

  // Handle save button click
  const handleSaveClick = useCallback(() => {
    // Open dialog to get dataset name
    setNameDialogOpen(true);
  }, [setNameDialogOpen]);

  // Handle the actual saving after getting the name
  const handleSaveWithName = useCallback(() => {
    const filters = {
      fromDate,
      toDate,
      limit: limitEnabled ? limit : "No limit",
      fetchType,
    };

    saveData(rows, filters, datasetName || null)
      .then(({ success, datasetId }) => {
        if (success) {
          // Refresh the stored datasets list in context
          refreshStoredDatasets && refreshStoredDatasets();

          setSnackbar({
            open: true,
            message: `Data saved successfully as dataset: ${
              datasetName || datasetId
            }`,
            severity: "success",
          });
          setNameDialogOpen(false);
          setDatasetName("");
        } else {
          throw new Error("Failed to save dataset");
        }
      })
      .catch((err) => {
        setSnackbar({
          open: true,
          message: `Error saving data: ${err.message}`,
          severity: "error",
        });
      });
  }, [
    rows,
    saveData,
    fromDate,
    toDate,
    limitEnabled,
    limit,
    fetchType,
    datasetName,
    refreshStoredDatasets,
    setSnackbar,
    setNameDialogOpen,
    setDatasetName,
  ]);

  return {
    handleSaveClick,
    handleSaveWithName,
  };
}
