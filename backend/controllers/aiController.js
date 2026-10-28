const Skill = require("../models/Skill");
const Goal = require("../models/Goal");
const LearningResource = require("../models/LearningResource");
const groqService = require("../services/groqService");

/**
 * Helper to fetch bounded workspace context for the authenticated user
 */
const fetchUserContext = async (user) => {
  const userId = user._id;

  const [skills, goals, learning] = await Promise.all([
    Skill.find({ user: userId })
      .select("name category level progress targetDate description")
      .sort({ progress: 1 }) // Surface lower progress first
      .limit(8),
    Goal.find({ user: userId })
      .select("title description category progress deadline completed")
      .sort({ completed: 1, deadline: 1 })
      .limit(5),
    LearningResource.find({ user: userId })
      .select("title source category progress completed")
      .sort({ updatedAt: -1 })
      .limit(5),
  ]);

  return {
    user: {
      name: user.name || "Member",
      role: user.role || "SkillTrack Member",
    },
    skills,
    goals,
    learning,
  };
};

/**
 * Handle upstream Groq / AI errors safely without leaking sensitive information
 */
const handleAIError = (err, res) => {
  if (err instanceof groqService.MissingApiKeyError || err.code === "MISSING_API_KEY") {
    return res.status(503).json({
      success: false,
      message: "AI services are currently unconfigured on this server. Please configure GROQ_API_KEY in your backend environment.",
      code: "AI_UNCONFIGURED",
    });
  }

  const message = err.message || "";
  const lowerMsg = message.toLowerCase();

  // Authentication error with Groq
  if (err.statusCode === 401 || err.code === "UPSTREAM_AUTH_ERROR" || lowerMsg.includes("invalid api key") || lowerMsg.includes("authentication")) {
    return res.status(401).json({
      success: false,
      message: "Groq authentication failed. Please check that GROQ_API_KEY is valid in your backend environment.",
      code: "UPSTREAM_AUTH_ERROR",
    });
  }

  // Rate limiting or quota exhaustion from Groq
  if (err.statusCode === 429 || err.code === "UPSTREAM_RATE_LIMIT" || lowerMsg.includes("429") || lowerMsg.includes("rate limit") || lowerMsg.includes("quota")) {
    return res.status(429).json({
      success: false,
      message: "The Groq AI service is currently receiving high demand or rate limits have been reached. Please try again shortly.",
      code: "UPSTREAM_RATE_LIMIT",
    });
  }

  // Model not found or configuration error
  if (err.statusCode === 404 || err.code === "UPSTREAM_MODEL_ERROR" || lowerMsg.includes("not found") || lowerMsg.includes("does not exist") || lowerMsg.includes("unknown model")) {
    return res.status(502).json({
      success: false,
      message: "The requested Groq model is currently unavailable. Please verify the GROQ_MODEL configuration.",
      code: "UPSTREAM_MODEL_ERROR",
    });
  }

  // Network / timeout error
  if (lowerMsg.includes("fetch failed") || lowerMsg.includes("econnrefused") || lowerMsg.includes("timeout") || lowerMsg.includes("aborted")) {
    return res.status(504).json({
      success: false,
      message: "Unable to establish connection with Groq. Please check your network connection.",
      code: "UPSTREAM_TIMEOUT",
    });
  }

  // Formatting / JSON parsing error
  if (lowerMsg.includes("failed to validate json") || lowerMsg.includes("json format") || lowerMsg.includes("unable to parse ai recommendations")) {
    return res.status(502).json({
      success: false,
      message: "The AI service encountered a formatting issue while preparing recommendations. Please retry.",
      code: "AI_FORMATTING_ERROR",
    });
  }

  console.error("Groq AI Integration Error:", message);
  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred while communicating with the AI service.",
  });
};

/**
 * POST /api/ai/chat
 * Interactive chat with the SkillTrack AI Assistant
 */
exports.chatWithAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate message
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required.",
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message exceeds maximum allowed length of 2,000 characters.",
      });
    }

    // Validate chat history format
    if (history !== undefined && !Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        message: "History must be an array of message turns.",
      });
    }

    if (Array.isArray(history) && history.length > 30) {
      return res.status(400).json({
        success: false,
        message: "History exceeds maximum allowed limit of 30 turns.",
      });
    }

    // Fetch strictly scoped user workspace context
    const userContext = await fetchUserContext(req.user);

    const result = await groqService.chat(userContext, message, history);

    return res.status(200).json({
      success: true,
      reply: result.reply,
      modelUsed: result.modelUsed,
      groundedSkillsCount: userContext.skills.length,
      groundedGoalsCount: userContext.goals.length,
    });
  } catch (err) {
    return handleAIError(err, res);
  }
};

/**
 * GET /api/ai/recommendations
 * Personalized, structured learning recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    // Fetch strictly scoped user workspace context
    const userContext = await fetchUserContext(req.user);

    const result = await groqService.getRecommendations(userContext);

    return res.status(200).json({
      success: true,
      recommendations: result.recommendations,
      count: result.recommendations.length,
      modelUsed: result.modelUsed,
    });
  } catch (err) {
    return handleAIError(err, res);
  }
};

/**
 * GET /api/ai/status
 * Lightweight endpoint to check if AI is configured without calling Groq API
 */
exports.getAIStatus = (req, res) => {
  const isConfigured = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
  const model = groqService.getModelName();
  const displayName = groqService.getModelDisplayName(model);

  return res.status(200).json({
    success: true,
    configured: isConfigured,
    available: isConfigured,
    model,
    displayName,
  });
};
