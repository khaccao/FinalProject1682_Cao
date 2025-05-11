const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  scheduleTime: {
    type: Date,
    required: true,
  },
  repeat: {
    type: String,
    default: "once",
  },
  status: {
    type: String,
    enum: ["incomplete", "completed", "skipped"],
    default: "incomplete",
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  toJSON: { getters: true },
  toObject: { getters: true },
});


module.exports = mongoose.model("Task", taskSchema);
