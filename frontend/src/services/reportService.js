import api from "./api";

/**
 * Fetch report data for the authenticated user.
 * @param {Object} options
 * @param {string} [options.type='overall'] - 'overall' | 'skills' | 'goals' | 'learning'
 * @param {string} [options.startDate] - ISO date string or YYYY-MM-DD
 * @param {string} [options.endDate] - ISO date string or YYYY-MM-DD
 * @returns {Promise<Object>} API response data with report metrics and datasets
 */
export const getReportData = async (options = {}) => {
  const params = {};
  if (options.type) params.type = options.type;
  if (options.startDate) params.startDate = options.startDate;
  if (options.endDate) params.endDate = options.endDate;

  const response = await api.get("/reports", { params });
  return response.data;
};
