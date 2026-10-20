const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, min: 3, max: 20, unique: true },
    email: { type: String, required: true, unique: true, max: 50 },
    password: { type: String, required: true, min: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);