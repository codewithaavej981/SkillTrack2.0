const express = require("express");
const protect = require("../middleware/authMiddleware");
const aiRateLimiter = require("../middleware/aiRateLimiter");
const aiController = require("../controllers/aiController");

const router = express.Router();

// Public/status route (still protected by user auth)
router.get("/status", protect, aiController.getAIStatus);

// AI Chat endpoint (authenticated + rate-limited)
router.post("/chat", protect, aiRateLimiter, aiController.chatWithAssistant);

// AI Recommendations endpoint (authenticated + rate-limited)
router.get("/recommendations", protect, aiRateLimiter, aiController.getRecommendations);

module.exports = router;
