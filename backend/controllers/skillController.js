const Skill = require('../models/Skill');

exports.getSkills = async (req, res, next) => {
  try { res.json({ success: true, skills: await Skill.find({ user: req.user._id }).sort({ createdAt: -1 }) }); } catch (error) { next(error); }
};

exports.createSkill = async (req, res, next) => {
  try {
    const { name, category, level, progress, targetDate, description } = req.body;
    if (!name || !category || !level) return res.status(400).json({ success: false, message: 'Name, category, and level are required' });
    const skill = await Skill.create({ user: req.user._id, name, category, level, progress, targetDate, description });
    res.status(201).json({ success: true, skill });
  } catch (error) { next(error); }
};

exports.updateSkill = async (req, res, next) => {
  try {
    const { name, category, level, progress, targetDate, description } = req.body;
    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, category, level, progress, targetDate, description },
      { new: true, runValidators: true }
    );
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, skill });
  } catch (error) { next(error); }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) { next(error); }
};
