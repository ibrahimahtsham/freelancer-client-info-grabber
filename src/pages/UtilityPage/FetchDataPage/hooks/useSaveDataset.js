import { useCallback } from "react";
import { format } from "date-fns";

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

  // Helper to format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return "not specified";

    if (typeof date === "string") {
      try {
        return format(new Date(date), "MM/dd/yyyy h:mm:ss a");
      } catch (e) {
        console.warn("Error formatting date string:", e);
        return date;
      }
    }

    if (date instanceof Date) {
      try {
        return format(date, "MM/dd/yyyy h:mm:ss a");
      } catch (e) {
        console.warn("Error formatting date object:", e);
        return date.toLocaleDateString();
      }
    }

    return String(date);
  };

  // Handle save button click
  const handleSaveClick = useCallback(() => {
    // Open dialog to get dataset name
    setNameDialogOpen(true);
  }, [setNameDialogOpen]);

  // CHANGE: Accept direct name parameter for immediate use
  const handleSaveWithName = useCallback(
    (directName = null) => {
      // Use direct name if provided, otherwise use state
      // This bypasses any async state timing issues
      const effectiveName = directName || datasetName || "";

      console.log("Saving with name:", effectiveName);

      // Format dates for display in metadata
      const fromFormatted = formatDateForDisplay(fromDate);
      const toFormatted = formatDateForDisplay(toDate);

      // Create filters object with both raw and formatted dates
      const filters = {
        fromDate,
        toDate,
        fromDateFormatted: fromFormatted,
        toDateFormatted: toFormatted,
        limit: limitEnabled ? limit : "No limit",
        fetchType,
      };

      // CHANGE: Use the effective name, with timestamp format that includes time
      const finalName =
        effectiveName.trim() ||
        `Dataset ${format(
          new Date(),
          "MM/dd/yyyy h:mm:ss a"
        )} (${fromFormatted} to ${toFormatted})`;

      // Call saveData with the name and filters
      saveData(rows, filters, finalName)
        .then(({ success }) => {
          if (success) {
            refreshStoredDatasets && refreshStoredDatasets();
            setSnackbar({
              open: true,
              message: `Data saved successfully as: ${finalName}`,
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
    },
    [
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
    ]
  );

  return {
    handleSaveClick,
    handleSaveWithName,
  };
}
