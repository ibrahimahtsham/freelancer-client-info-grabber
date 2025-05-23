import { Chip, Typography, Link, Box, Tooltip } from "@mui/material";
import { formatDate } from "../../../../../utils/dateUtils";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Define all columns with their formatting logic
export const ALL_COLUMNS = [
  { id: "bid_id", label: "Bid ID", width: 80 },
  { id: "project_id", label: "Project ID", width: 80 },
  { id: "project_title", label: "Project Title", width: 200 },
  {
    id: "project_url",
    label: "Project URL",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      return (
        <Link href={value} target="_blank" rel="noopener noreferrer">
          View Project
        </Link>
      );
    },
  },
  {
    id: "project_created",
    label: "Project Created",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      try {
        if (typeof value === "number") {
          return formatDate(new Date(value * 1000));
        }
        if (value instanceof Date) {
          return formatDate(value);
        }
        return formatDate(new Date(value));
      } catch {
        return "Invalid date";
      }
    },
  },
  { id: "client_name", label: "Client", width: 120 },
  {
    id: "client_url",
    label: "Client URL",
    width: 100,
    format: (value) => {
      if (!value) return "N/A";
      return (
        <Link href={value} target="_blank" rel="noopener noreferrer">
          View Profile
        </Link>
      );
    },
  },
  {
    id: "bid_amount",
    label: "Bid Amount",
    width: 100,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
  {
    id: "bid_time",
    label: "Bid Date",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      try {
        if (typeof value === "number") {
          return formatDate(new Date(value * 1000));
        }
        if (value instanceof Date) {
          return formatDate(value);
        }
        return formatDate(new Date(value));
      } catch (error) {
        console.warn("Failed to format date:", value, error);
        return "Invalid date";
      }
    },
  },
  {
    id: "award_status",
    label: "Award Status",
    width: 120,
    format: (value) => {
      if (!value) return <Chip size="small" label="Unknown" color="default" />;

      const status = value.toLowerCase();
      let chipProps = {
        label: value.charAt(0).toUpperCase() + value.slice(1),
        size: "small",
      };

      if (status === "awarded") {
        chipProps.color = "success";
      } else if (status === "pending") {
        chipProps.color = "warning";
      } else if (status === "rejected") {
        chipProps.color = "error";
      } else {
        chipProps.color = "default";
      }

      return <Chip {...chipProps} />;
    },
  },
  {
    id: "awarded_time",
    label: "Awarded Time",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      try {
        if (typeof value === "number") {
          return formatDate(new Date(value * 1000));
        }
        if (value instanceof Date) {
          return formatDate(value);
        }
        return formatDate(new Date(value));
      } catch {
        return "Invalid date";
      }
    },
  },
  {
    id: "paid_amount",
    label: "Paid",
    width: 100,
    format: (value, row) => {
      if (value === null || value === undefined) return "$0.00";

      const amount = typeof value !== "number" ? parseFloat(value) || 0 : value;
      const formattedValue = `$${amount.toFixed(2)}`;

      // Color code based on amount relative to bid amount
      let color = "inherit";
      if (row.bid_amount) {
        const ratio = amount / row.bid_amount;
        if (ratio >= 1) {
          color = "success.main"; // Full payment
        } else if (ratio >= 0.5) {
          color = "success.light"; // Significant payment
        } else if (ratio > 0) {
          color = "warning.main"; // Partial payment
        }
      }

      return (
        <Typography sx={{ color, fontWeight: 500 }}>
          {formattedValue}
        </Typography>
      );
    },
  },
  { id: "client_id", label: "Client ID", width: 80 },
  {
    id: "project_type",
    label: "Project Type",
    width: 100,
    format: (value) => {
      if (!value) return "Unknown";
      const type = value.toLowerCase();
      return (
        <Chip
          size="small"
          label={type.charAt(0).toUpperCase() + type.slice(1)}
          color={type === "hourly" ? "primary" : "secondary"}
        />
      );
    },
  },
  {
    id: "recruiter_project",
    label: "Recruiter",
    width: 120,
    format: (value) => (
      <Chip
        size="small"
        label={value ? "Recruiter" : "Non-Recruiter"}
        color={value ? "info" : "default"}
      />
    ),
  },
  {
    id: "min_budget",
    label: "Min Budget",
    width: 100,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
  {
    id: "max_budget",
    label: "Max Budget",
    width: 100,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
  { id: "total_bids", label: "Total Bids", width: 100 },
  {
    id: "avg_bid",
    label: "Avg Bid",
    width: 100,
    format: (value) => {
      if (value === null || value === undefined) return "$0.00";
      if (typeof value !== "number") return `$${parseFloat(value) || 0}.00`;
      return `$${value.toFixed(2)}`;
    },
  },
  {
    id: "skills",
    label: "Skills",
    width: 200,
    format: (value) => {
      if (!value) return "";
      if (!Array.isArray(value)) return String(value);

      if (value.length <= 3) {
        return value.map((skill, i) => (
          <Chip key={i} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
        ));
      }

      return (
        <Tooltip title={value.join(", ")}>
          <Box>
            {value.slice(0, 2).map((skill, i) => (
              <Chip
                key={i}
                label={skill}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            <Chip
              label={`+${value.length - 2}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Tooltip>
      );
    },
  },
  {
    id: "bid_proposal_link",
    label: "Proposal",
    width: 100,
    format: (value) => {
      if (!value) return "N/A";
      return (
        <Link href={value} target="_blank" rel="noopener noreferrer">
          View Proposal
        </Link>
      );
    },
  },
  {
    id: "received_response",
    label: "Response",
    width: 100,
    format: (value, row) => {
      const hasResponse =
        value === true || (row && row.award_status === "awarded");
      return (
        <Chip
          size="small"
          label={hasResponse ? "Yes" : "No"}
          color={hasResponse ? "success" : "default"}
        />
      );
    },
  },
  {
    id: "response_time",
    label: "Response Time",
    width: 120,
    format: (value, row) => {
      // Helper function to format seconds into readable time
      const formatTimeFromSeconds = (seconds) => {
        if (seconds <= 0) return "0s";

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (days > 0) {
          return `${days}d ${hours}h ${minutes}m ${secs}s`;
        } else if (hours > 0) {
          return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
          return `${minutes}m ${secs}s`;
        } else {
          return `${secs}s`;
        }
      };

      // If explicitly has a value, use it
      if (value) {
        // Color code based on response time
        let color = "inherit";
        if (value < 3600) {
          // Less than 1 hour
          color = "success.main";
        } else if (value < 86400) {
          // Less than 1 day
          color = "info.main";
        } else {
          color = "warning.main";
        }

        return (
          <Typography sx={{ color }}>{formatTimeFromSeconds(value)}</Typography>
        );
      }

      // If awarded but no response time, calculate from awarded_time and bid_time if available
      if (row && row.award_status === "awarded") {
        if (row.awarded_time && row.bid_time) {
          const awardedTime =
            typeof row.awarded_time === "number"
              ? row.awarded_time
              : new Date(row.awarded_time).getTime() / 1000;
          const bidTime =
            typeof row.bid_time === "number"
              ? row.bid_time
              : new Date(row.bid_time).getTime() / 1000;

          const diffSeconds = awardedTime - bidTime;
          if (diffSeconds > 0) {
            return formatTimeFromSeconds(diffSeconds);
          }
        }
        return "Awarded"; // If we can't calculate but it's awarded
      }

      return "N/A";
    },
  },
  {
    id: "first_message_time",
    label: "First Message",
    width: 120,
    format: (value) => {
      if (!value) return "N/A";
      try {
        if (typeof value === "number") {
          return formatDate(new Date(value * 1000));
        }
        if (value instanceof Date) {
          return formatDate(value);
        }
        return formatDate(new Date(value));
      } catch {
        return "Invalid date";
      }
    },
  },
  { id: "client_country", label: "Country", width: 120 },
  {
    id: "client_rating",
    label: "Rating",
    width: 80,
    format: (value) => {
      if (value === null || value === undefined) return "N/A";

      const rating = Number(value);

      // Color-code based on rating
      let color = "inherit";
      if (rating >= 4.5) {
        color = "success.main";
      } else if (rating >= 3.5) {
        color = "info.main";
      } else if (rating >= 2.5) {
        color = "warning.main";
      } else if (rating > 0) {
        color = "error.main";
      }

      return (
        <Typography sx={{ color, fontWeight: 500 }}>
          {rating.toFixed(1)}
        </Typography>
      );
    },
  },
  {
    id: "client_payment_verified",
    label: "Verified",
    width: 80,
    format: (value) => (
      <Chip
        size="small"
        label={value ? "Yes" : "No"}
        color={value ? "success" : "default"}
      />
    ),
  },
  {
    id: "milestone_payments",
    label: "Milestone Payments",
    width: 180,
    format: (value) => {
      // If no milestone payments or empty array
      if (!value || !Array.isArray(value) || value.length === 0) {
        return "No payments";
      }

      // Calculate the total amount
      const total = value.reduce(
        (sum, m) => sum + parseFloat(m.amount || 0),
        0
      );

      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 500 }}>
            {`${value.length} payments - $${total.toFixed(2)}`}
          </Typography>
          <KeyboardArrowDownIcon
            fontSize="small"
            sx={{ ml: 1, opacity: 0.6 }}
          />
        </Box>
      );
    },
  },
  {
    id: "client_verification_status",
    label: "Client Verification",
    width: 140,
    format: (value, row) => {
      // Count verified items
      const verifiedCount = [
        row.client_payment_verified,
        row.client_email_verified,
        row.client_phone_verified,
        row.client_identity_verified,
        row.client_profile_complete,
        row.client_deposit_made,
      ].filter(Boolean).length;

      const totalItems = 6;
      const level =
        verifiedCount < 2 ? "error" : verifiedCount < 4 ? "warning" : "success";

      return (
        <Tooltip
          title={`Payment: ${row.client_payment_verified ? "✓" : "✗"}, 
                        Email: ${row.client_email_verified ? "✓" : "✗"}, 
                        Phone: ${row.client_phone_verified ? "✓" : "✗"}, 
                        Identity: ${row.client_identity_verified ? "✓" : "✗"}, 
                        Profile: ${row.client_profile_complete ? "✓" : "✗"}, 
                        Deposit: ${row.client_deposit_made ? "✓" : "✗"}`}
        >
          <Chip
            size="small"
            label={`${verifiedCount}/${totalItems}`}
            color={level}
          />
        </Tooltip>
      );
    },
  },
  {
    id: "client_experience",
    label: "Client Experience",
    width: 120,
    format: (value, row) => {
      const projectCount = row.client_total_projects || 0;
      let experienceLevel = "New";
      let color = "default";

      if (projectCount > 50) {
        experienceLevel = "Expert";
        color = "success";
      } else if (projectCount > 20) {
        experienceLevel = "Experienced";
        color = "primary";
      } else if (projectCount > 5) {
        experienceLevel = "Intermediate";
        color = "info";
      } else if (projectCount > 0) {
        experienceLevel = "Beginner";
        color = "warning";
      }

      return (
        <Tooltip title={`${projectCount} completed projects`}>
          <Chip size="small" label={experienceLevel} color={color} />
        </Tooltip>
      );
    },
  },
  {
    id: "client_age",
    label: "Account Age",
    width: 120,
    format: (value, row) => {
      if (!row.client_registration_date) return "Unknown";

      const registrationDate = new Date(row.client_registration_date * 1000);
      const now = new Date();
      const diffYears = Math.floor(
        (now - registrationDate) / (1000 * 60 * 60 * 24 * 365)
      );

      return (
        <Tooltip title={`Registered: ${formatDate(registrationDate)}`}>
          <Typography>{diffYears} years</Typography>
        </Tooltip>
      );
    },
  },
  {
    id: "client_company",
    label: "Company",
    width: 150,
    format: (value) => value || "Not specified",
  },
];

// Default visible columns
export const DEFAULT_VISIBLE_COLUMNS = [
  "project_title",
  "client_name",
  "bid_amount",
  "bid_time",
  "award_status",
  "paid_amount",
  "project_type",
  "recruiter_project",
  "response_time",
  "client_rating",
  "client_payment_verified",
  "milestone_payments",
];
