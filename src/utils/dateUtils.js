/**
 * Format a date object to "DD MMM YYYY" format (e.g., "01 Jan 2024")
 * @param {Date} date - The date object to format
 * @returns {string} Formatted date string
 */
export const formatDateForAPI = (date) => {
  if (!date) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * Format a date string from "YYYY-MM-DD" to "DD MMM YYYY" format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string in DD MMM YYYY format
 */
export const formatInputDateForAPI = (dateString) => {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return formatDateForAPI(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Get date range (start and end dates) in API format based on predefined type
 * @param {string} type - Predefined date range type (today, yesterday, etc.)
 * @returns {Object} Object with startDate and endDate in "DD MMM YYYY" format
 */
export const getDateRangeFromType = (type) => {
  const today = new Date();
  let startDate = '';
  let endDate = '';
  
  switch (type) {
    case 'today':
      startDate = formatDateForAPI(today);
      endDate = formatDateForAPI(today);
      break;
      
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = formatDateForAPI(yesterday);
      endDate = formatDateForAPI(yesterday);
      break;
      
    case 'last7days':
      const last7days = new Date(today);
      last7days.setDate(today.getDate() - 6);
      startDate = formatDateForAPI(last7days);
      endDate = formatDateForAPI(today);
      break;
      
    case 'last30days':
      const last30days = new Date(today);
      last30days.setDate(today.getDate() - 29);
      startDate = formatDateForAPI(last30days);
      endDate = formatDateForAPI(today);
      break;
      
    case 'thisMonth':
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = formatDateForAPI(firstDayOfMonth);
      endDate = formatDateForAPI(today);
      break;
      
    case 'lastMonth':
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      startDate = formatDateForAPI(firstDayOfLastMonth);
      endDate = formatDateForAPI(lastDayOfLastMonth);
      break;
      
    default:
      break;
  }
  
  return { startDate, endDate };
}; 