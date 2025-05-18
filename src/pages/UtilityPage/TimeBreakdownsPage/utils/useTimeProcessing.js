import { useState, useEffect } from "react";
import { parseTime, isInShift, to24Hour } from "../../../../utils/dateUtils";

/**
 * Custom hook for processing time-based project data
 */
export function useTimeProcessing({ rows, employees = [] }) {
  // State for filtered projects
  const [filteredProjects, setFilteredProjects] = useState([]);

  // State for processing status
  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    progress: 0,
    stage: "",
  });

  // State for debug information
  const [debugInfo, setDebugInfo] = useState({
    total: 0,
    parsed: 0,
    example: "",
  });

  // Process data in smaller chunks to avoid UI freezing
  useEffect(() => {
    if (!rows.length || !employees.length) return;

    // Start processing in non-blocking chunks
    let employeeProjects = employees.map(() => ({
      awarded: [],
      other: [],
    }));

    let totalProcessed = 0;
    let totalWithDate = 0;
    let successfullyParsed = 0;
    let exampleDate = "";

    // Set initial processing state
    setProcessingState({
      isProcessing: true,
      progress: 0,
      stage: "Analyzing project dates",
    });

    // Process in chunks of 50 items to avoid UI freezes
    const chunkSize = 50;
    const totalChunks = Math.ceil(rows.length / chunkSize);
    let currentChunk = 0;

    const processNextChunk = () => {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, rows.length);

      // Process this chunk
      for (let i = start; i < end; i++) {
        const row = rows[i];

        if (row.projectUploadDate && row.projectUploadDate !== "N/A") {
          totalWithDate++;
          if (!exampleDate) exampleDate = row.projectUploadDate;

          // Parse the time
          const hour = parseTime(row.projectUploadDate);

          if (hour !== null) {
            successfullyParsed++;

            // Check each employee's shift
            employees.forEach((employee, index) => {
              // Calculate 24-hour shift times
              const employeeStart = to24Hour(
                employee.startHour,
                employee.startAmPm
              );
              const employeeEnd = to24Hour(employee.endHour, employee.endAmPm);

              // Check if in employee's shift
              if (isInShift(hour, employeeStart, employeeEnd)) {
                if (row.awarded === "Yes") {
                  employeeProjects[index].awarded.push(row);
                } else {
                  employeeProjects[index].other.push(row);
                }
              }
            });
          }
        }
      }

      currentChunk++;
      totalProcessed = end;

      // Update progress
      setProcessingState({
        isProcessing: currentChunk < totalChunks,
        progress: Math.round((currentChunk / totalChunks) * 100),
        stage: `Processing ${totalProcessed} of ${rows.length} projects`,
      });

      // If more chunks to process, schedule the next one
      if (currentChunk < totalChunks) {
        setTimeout(processNextChunk, 10); // Small delay to let UI update
      } else {
        // All done, update filtered projects
        setFilteredProjects(employeeProjects);

        setDebugInfo({
          total: totalWithDate,
          parsed: successfullyParsed,
          example: exampleDate,
        });

        // Mark processing as complete
        setProcessingState({
          isProcessing: false,
          progress: 100,
          stage: "Completed",
        });
      }
    };

    // Start processing the first chunk
    processNextChunk();
  }, [rows, employees]);

  return { filteredProjects, processingState, debugInfo };
}
