const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

exports.processPayment = async (req, res) => {
    try {
        const { bookingId, userId, paymentMethod } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized transaction." });
        }

        // Fetch actual amount from DB to prevent frontend manipulation
        const actualAmount = booking.totalPrice; 

        const transactionId = 'TXN_' + Date.now() + Math.floor(Math.random() * 1000);

        const payment = new Payment({
            booking: bookingId,
            user: userId,
            amount: actualAmount,
            paymentMethod: paymentMethod || 'UPI',
            transactionId: transactionId,
            status: 'Success'
        });

        await payment.save();

        res.status(200).json({ 
            message: "Payment processed successfully", 
            payment 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};