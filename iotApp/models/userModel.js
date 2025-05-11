const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    codesx: { type: String },
    createdAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);