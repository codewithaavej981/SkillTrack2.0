const Goal = require('../models/Goal');

exports.getGoals = async (req, res, next) => {
  try { res.json({ success: true, goals: await Goal.find({ user: req.user._id }).sort({ createdAt: -1 }) }); } catch (error) { next(error); }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { title, description, category, progress, deadline, completed } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const goal = await Goal.create({ user: req.user._id, title, description, category, progress, deadline, completed });
    res.status(201).json({ success: true, goal });
  } catch (error) { next(error); }
};

exports.updateGoal = async (req, res, next) => {
  try {
        const { title, description, category, progress, deadline, completed } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, category, progress, deadline, completed },
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, goal });
  } catch (error) { next(error); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) { next(error); }
};
