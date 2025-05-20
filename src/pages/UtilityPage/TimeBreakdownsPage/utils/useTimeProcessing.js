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

    console.log("Starting time processing with", rows.length, "projects");

    // Start processing in non-blocking chunks
    const processedProjects = {};

    employees.forEach((employee, index) => {
      // Convert shift times using the shared utility
      const startHour24 = to24Hour(employee.startHour, employee.startAmPm);
      const endHour24 = to24Hour(employee.endHour, employee.endAmPm);

      console.log(
        `Employee ${index} (${employee.name}): Shift ${startHour24}:00 to ${endHour24}:00`
      );

      // Filter projects for this employee using shared logic
      const employeeProjects = rows.filter((row) => {
        // Get full datetime object instead of just hour
        const projectTime = parseProjectDateTime(row.projectUploadDate);

        // Log more details for debugging
        if (row.awarded === "Yes") {
          console.log(
            `Project ID: ${row.projectId}, Date: ${row.projectUploadDate}, ` +
              `Parsed Hour: ${projectTime}, Raw Time: ${row.projectUploadDate}, ` +
              `Shift: ${startHour24}-${endHour24}, ` +
              `In Shift: ${isInShift(
                projectTime,
                startHour24,
                endHour24
              )}, Awarded: Yes`
          );
        }

        return isInShift(projectTime, startHour24, endHour24);
      });

      console.log(
        `Employee ${index}: Found ${employeeProjects.length} projects in shift`
      );

      // Separate awarded and other projects
      const awardedProjects = employeeProjects.filter(
        (project) => project.awarded === "Yes"
      );

      console.log(
        `Employee ${index}: ${awardedProjects.length} awarded projects in shift`
      );

      processedProjects[index] = {
        awarded: awardedProjects,
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
