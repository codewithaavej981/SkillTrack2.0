const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Skill name is required'], trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    level: { type: String, required: [true, 'Level is required'], trim: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    targetDate: { type: Date },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
