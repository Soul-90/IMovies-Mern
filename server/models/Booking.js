const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    seatNumbers: [{ type: String, required: true }],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Confirmed', enum: ['Confirmed', 'Cancelled'] }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);