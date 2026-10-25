const LearningResource = require("../models/LearningResource");

// Get resources belonging to the logged-in user
const getLearningResources = async (req, res) => {
  try {
    const resources = await LearningResource.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

// Create resource for the logged-in user
const createLearningResource = async (req, res) => {
  try {
    const { title, source, category, url, progress, completed } = req.body;

    const resource = await LearningResource.create({
      title,
      source,
      category,
      url: url || "",
      progress:
        progress !== undefined
          ? Math.min(100, Math.max(0, Number(progress) || 0))
          : 0,
      completed:
        completed !== undefined
          ? Boolean(completed)
          : Number(progress) >= 100,
      user: req.user._id,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: "Failed to create resource" });
  }
};

// Update only the logged-in user's resource
const updateLearningResource = async (req, res) => {
  try {
    const resource = await LearningResource.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: "Failed to update resource" });
  }
};

// Delete only the logged-in user's resource
const deleteLearningResource = async (req, res) => {
  try {
    const resource = await LearningResource.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete resource" });
  }
};

module.exports = {
  getLearningResources,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
};
