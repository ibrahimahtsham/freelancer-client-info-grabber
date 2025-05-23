import { useState, useEffect } from "react";
import { parseProjectDateTime, to24Hour } from "./projectTimeUtils";

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
    setProcessingState({
      isProcessing: true,
      progress: 10,
      stage: "Processing employee shifts",
    });

    // Start processing in non-blocking chunks
    const processedProjects = {};
    let parsedCount = 0;

    try {
      employees.forEach((employee, index) => {
        // Convert shift times using the shared utility
        const startHour24 = to24Hour(employee.startHour, employee.startAmPm);
        const endHour24 = to24Hour(employee.endHour, employee.endAmPm);

        console.log(
          `Employee ${index} (${employee.name}): Shift ${startHour24}:00 to ${endHour24}:00`
        );

        // Filter projects for this employee using shared logic
        const employeeProjects = rows.filter((row) => {
          // Use bid_time as the timestamp to check
          const projectDateTime = parseProjectDateTime(row.bid_time);

          if (!projectDateTime) {
            return false;
          }

          parsedCount++;

          const projectHour = projectDateTime.getHours();

          // Handle shifts that cross midnight
          if (startHour24 <= endHour24) {
            return projectHour >= startHour24 && projectHour < endHour24;
          } else {
            // Shift crosses midnight (e.g., 10pm to 6am)
            return projectHour >= startHour24 || projectHour < endHour24;
          }
        });

        console.log(
          `Employee ${index}: Found ${employeeProjects.length} projects in shift`
        );

        // Separate awarded and other projects
        processedProjects[index] = {
          awarded: employeeProjects.filter(
            (project) => project.award_status?.toLowerCase() === "awarded"
          ),
          other: employeeProjects.filter(
            (project) => project.award_status?.toLowerCase() !== "awarded"
          ),
        };

        // Update progress
        setProcessingState((prev) => ({
          ...prev,
          progress: 10 + (80 * (index + 1)) / employees.length,
          stage: `Processing shift data for ${employee.name}`,
        }));
      });

      // Complete the processing and update state
      setFilteredProjects(processedProjects);

      setDebugInfo({
        total: rows.length,
        parsed: parsedCount,
        example:
          rows.length > 0 ? new Date(rows[0].bid_time * 1000).toString() : "",
      });

      setProcessingState({
        isProcessing: false,
        progress: 100,
        stage: "Completed",
      });
    } catch (error) {
      console.error("Error processing time data:", error);
      setProcessingState({
        isProcessing: false,
        progress: 0,
        stage: "Error: " + error.message,
      });
    }
  }, [rows, employees, selectedEmployeeIndex]);

  return { filteredProjects, processingState, debugInfo };
}
