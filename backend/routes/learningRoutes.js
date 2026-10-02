const express = require("express");
const router = express.Router();

const {
  getLearningResources,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
} = require("../controllers/learningController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getLearningResources);
router.post("/", createLearningResource);
router.put("/:id", updateLearningResource);
router.delete("/:id", deleteLearningResource);

module.exports = router;