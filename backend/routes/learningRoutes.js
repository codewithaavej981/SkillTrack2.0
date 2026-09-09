const express = require("express");

const {
  getLearningResources,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
} = require("../controllers/learningController");

const router = express.Router();

router.get("/", getLearningResources);
router.post("/", createLearningResource);
router.put("/:id", updateLearningResource);
router.delete("/:id", deleteLearningResource);

module.exports = router;