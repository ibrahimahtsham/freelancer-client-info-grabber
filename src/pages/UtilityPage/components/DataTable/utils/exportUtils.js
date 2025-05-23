import { ALL_COLUMNS } from "./columnDefs";
import { formatTimestamp } from "./formatters";

/**
 * Generate CSV data from table rows
 * @param {Array} data - Table data rows
 * @param {Array} visibleColumns - IDs of visible columns
 * @param {string} title - Title for the CSV file
 * @returns {string} - CSV data as a string
 */
export function generateCSV(data, visibleColumns) {
  // Get visible columns
  const visibleColumnsData = ALL_COLUMNS.filter((col) =>
    visibleColumns.includes(col.id)
  );

  // Create header row
  let csv = visibleColumnsData.map((col) => `"${col.label}"`).join(",") + "\n";

  // Add data rows
  data.forEach((row) => {
    const rowData = visibleColumnsData
      .map((col) => {
        let value = row[col.id];

        // For special fields that have formatting, extract the raw value
        if (col.id === "milestone_payments") {
          if (Array.isArray(value) && value.length > 0) {
            const total = value.reduce(
              (sum, m) => sum + parseFloat(m.amount || 0),
              0
            );
            value = `${value.length} payments - $${total.toFixed(2)}`;
          } else {
            value = "No payments";
          }
        } else if (col.id === "client_verification_status" && row) {
          // For client verification status, show the actual verification items
          const verifiedItems = [
            row.client_payment_verified ? "Payment" : null,
            row.client_email_verified ? "Email" : null,
            row.client_phone_verified ? "Phone" : null,
            row.client_identity_verified ? "Identity" : null,
            row.client_profile_complete ? "Profile" : null,
            row.client_deposit_made ? "Deposit" : null,
          ].filter(Boolean);

          value = verifiedItems.length > 0 ? verifiedItems.join(", ") : "None";
        } else if (col.id === "client_badges") {
          // For badges, join the array with commas
          value = Array.isArray(value) ? value.join(", ") : "None";
        }

        // Convert arrays to comma-separated strings
        if (Array.isArray(value)) {
          value = value.join(", ");
        }

        // Format dates
        if (col.id.includes("time") && typeof value === "number") {
          try {
            value = formatTimestamp(value);
          } catch {
            // Keep as is if formatting fails
          }
        }

        // Prepare value for CSV (wrap in quotes, escape quotes within)
        return `"${String(value || "").replace(/"/g, '""')}"`;
      })
      .join(",");

    csv += rowData + "\n";
  });

  return csv;
}

/**
 * Download data as CSV file
 * @param {Array} data - Table data
 * @param {Array} visibleColumns - Visible column IDs
 * @param {string} title - Title for the file
 */
export function downloadCSV(data, visibleColumns, title) {
  const csv = generateCSV(data, visibleColumns, title);

  // Create download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${title || "data"}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
