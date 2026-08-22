const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
    },
    description: { type: String, trim: true, default: "" },

    category: {
      type: String,
      enum: [
        "Web Development",
        "AI / ML",
        "Cybersecurity",
        "Data Science",
        "Other",
      ],
      default: "Web Development",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    deadline: { type: Date },

    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Goal", goalSchema);
