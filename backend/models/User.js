const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Stored as plain text to keep beginner-friendly
    monthlyIncome: { type: Number, default: 0 },
    monthlyBudget: { type: Number, default: 0 },
    currency: { type: String, default: '$' },
    theme: { type: String, default: 'dark' },
    onboarded: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
