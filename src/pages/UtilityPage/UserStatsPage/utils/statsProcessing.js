/**
 * Process user data to extract meaningful statistics
 * @param {Object} userData - Raw user data from API
 * @returns {Object} - Processed statistics
 */
export function processUserStats(userData) {
  if (!userData) return null;

  // Look for reputation data in multiple possible locations
  const repData =
    userData.full_reputation && !isEmpty(userData.full_reputation)
      ? userData.full_reputation
      : userData.reputation ||
        (userData.directory_data && userData.directory_data.reputation) ||
        {};

  const entireHistory = repData.entire_history || {};
  const last3months = repData.last3months || {};
  const last12months = repData.last12months || {};

  // Get job history from reputation data
  const jobHistory = repData.job_history || {};
  const jobCounts = jobHistory.job_counts || [];

  // Process registration date
  const registrationDate = userData.registration_date
    ? new Date(userData.registration_date * 1000)
    : null;

  // Calculate account age
  let activeSince = "Unknown";
  if (registrationDate) {
    const now = new Date();
    const yearDiff = now.getFullYear() - registrationDate.getFullYear();
    const monthDiff = now.getMonth() - registrationDate.getMonth();

    if (yearDiff > 0) {
      activeSince = `${yearDiff} year${yearDiff !== 1 ? "s" : ""}`;
      if (monthDiff > 0) {
        activeSince += `, ${monthDiff} month${monthDiff !== 1 ? "s" : ""}`;
      }
    } else if (monthDiff > 0) {
      activeSince = `${monthDiff} month${monthDiff !== 1 ? "s" : ""}`;
    } else {
      const dayDiff = now.getDate() - registrationDate.getDate();
      activeSince = `${dayDiff} day${dayDiff !== 1 ? "s" : ""}`;
    }
  }

  // Get jobs data - prioritize directory data which might be more complete
  const jobsData = userData.directory_data?.jobs || userData.jobs || [];

  // Count skills by category
  const skills = {};
  const skillsByCategory = {};

  if (jobsData && Array.isArray(jobsData)) {
    jobsData.forEach((job) => {
      const categoryName = job.category?.name || "Other";
      const jobName = job.name || "Unknown";

      // Count skills overall
      if (!skills[jobName]) {
        skills[jobName] = 0;
      }
      skills[jobName]++;

      // Group by category
      if (!skillsByCategory[categoryName]) {
        skillsByCategory[categoryName] = {};
      }
      if (!skillsByCategory[categoryName][jobName]) {
        skillsByCategory[categoryName][jobName] = 0;
      }
      skillsByCategory[categoryName][jobName]++;
    });
  }

  // Create a more comprehensive skills list by combining both sources
  let topSkillsWithCounts = [];

  // First process the job_counts data which has accurate counts
  if (jobCounts && Array.isArray(jobCounts)) {
    jobCounts.forEach((item) => {
      if (item.job && item.count) {
        topSkillsWithCounts.push({
          name: item.job.name,
          count: item.count,
          category: item.job.category?.name || "Other",
        });
      }
    });
  }

  // Now add any skills from jobsData that aren't already in the list
  if (jobsData && Array.isArray(jobsData)) {
    // Create a map of skills already added
    const existingSkills = new Set(
      topSkillsWithCounts.map((item) => item.name)
    );

    // Process skills from our complete jobs data
    Object.entries(skills).forEach(([skillName, count]) => {
      if (!existingSkills.has(skillName)) {
        // Find category for this skill
        let category = "Other";
        for (const [catName, catSkills] of Object.entries(skillsByCategory)) {
          if (catSkills[skillName]) {
            category = catName;
            break;
          }
        }

        topSkillsWithCounts.push({
          name: skillName,
          count: count,
          category: category,
        });
      }
    });
  }

  // Sort all skills by count in descending order
  topSkillsWithCounts.sort((a, b) => b.count - a.count);

  // Get qualifications - prioritize directory data
  const qualifications =
    userData.directory_data?.qualifications || userData.qualifications || [];

  // Get badges - prioritize directory data
  const badges = userData.directory_data?.badges || userData.badges || [];

  // Get profile description - prioritize directory data
  const profileDescription =
    userData.directory_data?.profile_description ||
    userData.profile_description ||
    "";

  // Process and format earnings if available
  const earnings = entireHistory.earnings || 0;
  const formattedEarnings =
    typeof earnings === "number" ? earnings.toFixed(2) : "0.00";

  // Determine if we have meaningful freelancer data
  const hasFreelancerData =
    entireHistory.reviews > 0 ||
    entireHistory.complete > 0 ||
    userData.role === "freelancer" ||
    badges.length > 0 ||
    jobCounts.length > 0;

  // Return processed data
  return {
    username: userData.username,
    displayName: userData.display_name || userData.username,
    profileImage: userData.avatar_large_cdn || userData.avatar_cdn,
    registrationDate,
    activeSince,
    hasFreelancerData,
    profileDescription,
    reputation: {
      overall: entireHistory.overall || 0,
      onBudget: entireHistory.on_budget || 0,
      onTime: entireHistory.on_time || 0,
      categoryRatings: entireHistory.category_ratings || {},
      recent3Months: {
        overall: last3months.overall || 0,
        reviews: last3months.reviews || 0,
      },
      recent12Months: {
        overall: last12months.overall || 0,
        reviews: last12months.reviews || 0,
      },
      totalReviews: entireHistory.reviews || 0,
    },
    totalEarnings: formattedEarnings,
    projectsCompleted: entireHistory.complete || 0,
    completionRate: Math.round((entireHistory.completion_rate || 0) * 100),
    totalReviews: entireHistory.reviews || 0,
    skills,
    skillsByCategory,
    topSkillsWithCounts, // Added top skills with counts from job_history
    qualifications,
    badges,
    loginInfo: {
      devices: userData.devices || [],
      lastLogin: userData.last_login_time
        ? new Date(userData.last_login_time * 1000)
        : null,
    },
    projectStats: {
      completed: entireHistory.complete || 0,
      inProgress: entireHistory.incomplete || 0,
      total: (entireHistory.complete || 0) + (entireHistory.incomplete || 0),
      onBudgetRate: Math.round((entireHistory.on_budget || 0) * 100),
      onTimeRate: Math.round((entireHistory.on_time || 0) * 100),
    },
    verificationStatus: {
      payment: userData.status?.payment_verified || false,
      email: userData.status?.email_verified || false,
      phone: userData.status?.phone_verified || false,
      identity: userData.status?.identity_verified || false,
      profileComplete: userData.status?.profile_complete || false,
    },
    role: userData.role || "freelancer",
    hourlyRate: userData.hourly_rate || 0,
    location: userData.location,
    // Add employer stats if available
    employerStats: userData.employer_reputation?.project_stats
      ? {
          openProjects: userData.employer_reputation.project_stats.open || 0,
          workInProgress:
            userData.employer_reputation.project_stats.work_in_progress || 0,
          completedProjects:
            userData.employer_reputation.project_stats.complete || 0,
          pendingProjects:
            userData.employer_reputation.project_stats.pending || 0,
          draftProjects: userData.employer_reputation.project_stats.draft || 0,
        }
      : null,
  };
}

// Helper function to check if an object is empty
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) return "N/A";

  try {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}
