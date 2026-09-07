const LearningResource = require("../models/LearningResource");

// Get all learning resources
const getLearningResources = async (req, res) => {
  const resources = await LearningResource.find().sort({ createdAt: -1 });

  res.json(resources);
};

// Create learning resource
const createLearningResource = async (req, res) => {
  const resource = await LearningResource.create(req.body);

  res.status(201).json(resource);
};

// Update learning resource
const updateLearningResource = async (req, res) => {
  const resource = await LearningResource.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.json(resource);
};

// Delete learning resource
const deleteLearningResource = async (req, res) => {
  const resource = await LearningResource.findByIdAndDelete(
    req.params.id
  );

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.json({ message: "Resource deleted successfully" });
};

module.exports = {
  getLearningResources,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
};