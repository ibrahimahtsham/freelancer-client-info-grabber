/**
 * Process user data to extract meaningful statistics
 * @param {Object} userData - Raw user data from API
 * @returns {Object} - Processed statistics
 */
export function processUserStats(userData) {
  if (!userData) return null;

  // Extract reputation data - handle the new nested structure
  const reputationData = userData.reputation || {};
  
  // These might be at different levels depending on the API response structure
  const entireHistory = reputationData.entire_history || 
                       reputationData.freelancer?.entire_history || 
                       reputationData.employer?.entire_history || 
                       {};
                       
  const last3months = reputationData.last3months || 
                     reputationData.freelancer?.last3months || 
                     reputationData.employer?.last3months || 
                     {};
                     
  const last12months = reputationData.last12months || 
                      reputationData.freelancer?.last12months || 
                      reputationData.employer?.last12months || 
                      {};

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
      activeSince = `${yearDiff} year${yearDiff !== 1 ? 's' : ''}`;
      if (monthDiff > 0) {
        activeSince += `, ${monthDiff} month${monthDiff !== 1 ? 's' : ''}`;
      }
    } else if (monthDiff > 0) {
      activeSince = `${monthDiff} month${monthDiff !== 1 ? 's' : ''}`;
    } else {
      const dayDiff = now.getDate() - registrationDate.getDate();
      activeSince = `${dayDiff} day${dayDiff !== 1 ? 's' : ''}`;
    }
  }

  // Determine if this account has meaningful freelancer data
  const hasFreelancerData = 
    (entireHistory.reviews > 0) || 
    (entireHistory.complete > 0) || 
    (userData.role === 'freelancer');

  // Extract skills from directory data or jobs
  const skills = {};
  
  // Try to get skills from directory data (more detailed)
  if (userData.directory_data?.jobs && Array.isArray(userData.directory_data.jobs)) {
    userData.directory_data.jobs.forEach(job => {
      const category = job.category?.name || "Other";
      if (!skills[category]) {
        skills[category] = 0;
      }
      skills[category]++;
    });
  } 
  // Fallback to regular jobs data
  else if (userData.jobs && Array.isArray(userData.jobs)) {
    userData.jobs.forEach(job => {
      const category = job.category?.name || "Other";
      if (!skills[category]) {
        skills[category] = 0;
      }
      skills[category]++;
    });
  }

  // Process login information
  const loginInfo = {
    devices: userData.devices || [],
    // Add more login info if available
  };

  // Process earnings if available
  const earnings = entireHistory.earnings || 0;
  const formattedEarnings = typeof earnings === 'number' ? earnings.toFixed(2) : '0.00';

  // Get qualifications from directory data
  const qualifications = userData.directory_data?.qualifications || userData.qualifications || [];

  // Return structured data
  return {
    username: userData.username,
    displayName: userData.display_name || userData.username,
    profileImage: userData.avatar_large_cdn || userData.avatar_cdn || null,
    registrationDate,
    activeSince,
    hasFreelancerData,
    profileDescription: userData.profile_description || userData.directory_data?.profile_description || null,
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
    },
    totalEarnings: formattedEarnings,
    projectsCompleted: entireHistory.complete || 0,
    completionRate: Math.round((entireHistory.completion_rate || 0) * 100),
    totalReviews: entireHistory.reviews || 0,
    skills,
    qualifications,
    badges: userData.badges || [],
    jobCount: (userData.jobs?.length || 0) || (userData.directory_data?.jobs?.length || 0),
    profileVerified: userData.status?.freelancer_verified_user || false,
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
    loginInfo
  };
}

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) return 'N/A';
  
  try {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
}