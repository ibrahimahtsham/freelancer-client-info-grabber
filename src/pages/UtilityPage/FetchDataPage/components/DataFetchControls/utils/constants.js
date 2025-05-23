// Define data fetch types
export const FETCH_TYPES = [
  {
    value: "complete",
    label: "Complete Data (All Sources)",
    description:
      "Fetches bids, projects, threads, milestones and client details",
  },
  {
    value: "bids_only",
    label: "Bids Only",
    description: "Fetches only bid data with minimal project info",
  },
  {
    value: "projects_only",
    label: "Project Details Only",
    description: "Fetches only detailed project information",
  },
  {
    value: "clients_only",
    label: "Client Profiles Only",
    description: "Fetches only client profile information",
  },
  {
    value: "threads_only",
    label: "Threads Only",
    description: "Fetches conversation threads",
  },
];

// Define presets for date ranges
export const DATE_PRESETS = [
  {
    label: "Last 7 days",
    getValue: () => {
      const to = new Date();

      const from = new Date();
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0); // Set to beginning of day (12:00 AM)

      return { from, to };
    },
  },
  {
    label: "This month",
    getValue: () => {
      const to = new Date();

      const from = new Date();
      from.setDate(1); // First day of current month
      from.setHours(0, 0, 0, 0); // Set to beginning of day (12:00 AM)

      return { from, to };
    },
  },
  {
    label: "Last month",
    getValue: () => {
      // Last day of previous month (set date to 0 of current month)
      const to = new Date();
      to.setDate(0); // Last day of previous month
      to.setHours(23, 59, 59, 999); // Set to end of day (11:59:59 PM)

      // First day of previous month
      const from = new Date(to); // Copy the date from 'to'
      from.setDate(1); // First day of the month
      from.setHours(0, 0, 0, 0); // Set to beginning of day (12:00 AM)

      return { from, to };
    },
  },
  {
    label: "All time",
    getValue: () => {
      // To: Current date at end of day
      const to = new Date();

      // From: Jan 1st of current year at beginning of day
      const from = new Date();
      from.setMonth(0); // January
      from.setDate(1); // 1st day
      from.setHours(0, 0, 0, 0);

      return { from, to };
    },
  },
];
