import api from "./api";

/**
 * Check if Groq AI service is configured on the backend
 * @returns {Promise<{ available: boolean, model: string }>}
 */
export const getAIStatus = async () => {
  const response = await api.get("/ai/status");
  return response.data;
};

/**
 * Send interactive message to SkillTrack AI Assistant
 * @param {string} message - Current prompt/question
 * @param {Array<{ role: 'user'|'model', text: string }>} history - Prior conversation turns
 * @returns {Promise<{ reply: string, modelUsed: string, groundedSkillsCount: number, groundedGoalsCount: number }>}
 */
export const chatWithAI = async (message, history = []) => {
  const response = await api.post("/ai/chat", {
    message,
    history,
  });
  return response.data;
};

/**
 * Fetch personalized curriculum recommendations grounded in skills and goals
 * @returns {Promise<{ recommendations: Array, count: number, modelUsed: string }>}
 */
export const getAIRecommendations = async () => {
  const response = await api.get("/ai/recommendations");
  return response.data;
};
