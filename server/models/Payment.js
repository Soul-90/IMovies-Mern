const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true, enum: ['Card', 'UPI', 'NetBanking', 'Wallet'] },
    transactionId: { type: String, required: true, unique: true },
    status: { type: String, default: 'Success', enum: ['Success', 'Failed', 'Refunded'] }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);