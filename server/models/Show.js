const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    movie: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Movie', 
        required: true 
    },
    theater: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Theater', 
        required: true 
    },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:MM
    ticketPrice: { type: Number, required: true },
    totalSeats: { type: Number, default: 60 },
    availableSeats: { type: Number, default: 60 }
}, { timestamps: true });

module.exports = mongoose.model("Show", showSchema);