import { useState, useEffect } from "react";
import {
  parseProjectDateTime,
  isInShift,
  to24Hour,
} from "../../../../utils/projectTimeUtils";

/**
 * Custom hook for processing time-based project data
 */
export function useTimeProcessing({ rows, employees, selectedEmployeeIndex }) {
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
    const processedProjects = {};

    employees.forEach((employee, index) => {
      // Convert shift times using the shared utility
      const startHour24 = to24Hour(employee.startHour, employee.startAmPm);
      const endHour24 = to24Hour(employee.endHour, employee.endAmPm);

      // Filter projects for this employee using shared logic
      const employeeProjects = rows.filter((row) => {
        const hour = parseProjectDateTime(row.projectUploadDate);
        return isInShift(hour, startHour24, endHour24);
      });

      // Separate awarded and other projects
      processedProjects[index] = {
        awarded: employeeProjects.filter(
          (project) => project.awarded === "Yes"
        ),
        other: employeeProjects.filter((project) => project.awarded !== "Yes"),
      };
    });

    // Complete the processing and update state
    setFilteredProjects(processedProjects);

    setDebugInfo({
      total: rows.length,
      parsed: Object.values(processedProjects).reduce(
        (sum, projects) =>
          sum + projects.awarded.length + projects.other.length,
        0
      ),
      example: rows.length > 0 ? rows[0].projectUploadDate : "",
    });

    setProcessingState({
      isProcessing: false,
      progress: 100,
      stage: "Completed",
    });
  }, [rows, employees, selectedEmployeeIndex]);

  return { filteredProjects, processingState, debugInfo };
}
