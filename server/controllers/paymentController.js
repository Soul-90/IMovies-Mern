const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Process payment and attach transaction ID
exports.processPayment = async (req, res) => {
    try {
        const { bookingId, userId, amount, paymentMethod } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Generate unique transaction reference ID
        const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

        const newPayment = new Payment({
            booking: bookingId,
            user: userId,
            amount,
            paymentMethod,
            transactionId,
            status: 'Success'
        });

        await newPayment.save();

        res.status(201).json({ 
            message: "Payment processed successfully!", 
            payment: newPayment 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get payment receipt by booking ID
exports.getPaymentByBooking = async (req, res) => {
    try {
        const payment = await Payment.findOne({ booking: req.params.bookingId });
        res.status(200).json(payment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};