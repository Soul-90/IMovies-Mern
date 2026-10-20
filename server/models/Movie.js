const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    language: { type: String, required: true },
    duration: { type: String, default: '2h 00m' },
    cast: { type: String, default: 'N/A' },
    releaseDate: { type: String, default: '2026' },
    rating: { type: Number, default: 4.5 },
    description: { type: String },
    posterUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);