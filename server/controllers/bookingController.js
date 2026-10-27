const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Payment = require('../models/Payment'); // Added Payment model for refunds

exports.createBooking = async (req, res) => {
    try {
        // SECURITY FIX 1: Expect 'expectedPrice' from frontend to prevent Bait-and-Switch
        const { userId, showId, seatNumbers, expectedPrice } = req.body;

        const show = await Show.findById(showId);
        if (!show) return res.status(404).json({ message: "Show not found" });

        const showDateTime = new Date(`${show.date}T${show.time}:00+05:30`);
        const currentServerTime = new Date();
        
        if (showDateTime < currentServerTime) {
            return res.status(400).json({ message: "Cannot book tickets for a show that has already started or ended." });
        }

        if (show.availableSeats < seatNumbers.length) {
            return res.status(400).json({ message: "Not enough seats available." });
        }

        const existingBookings = await Booking.find({ show: showId, status: 'Confirmed' });
        const occupiedSeats = existingBookings.reduce((acc, booking) => acc.concat(booking.seatNumbers), []);
        
        if (seatNumbers.some(seat => occupiedSeats.includes(seat))) {
            return res.status(400).json({ message: "One or more seats were just booked. Please refresh." });
        }

        // DYNAMIC PRICING CALCULATION
        const basePrice = show.ticketPrice;
        let multiplier = 1.0;
        const occupancyRate = (show.totalSeats - show.availableSeats) / show.totalSeats;

        if (occupancyRate >= 0.8) multiplier += 0.2;
        else if (occupancyRate >= 0.5) multiplier += 0.1;

        const hoursUntilShow = (showDateTime - currentServerTime) / (1000 * 60 * 60);
        if (hoursUntilShow > 0 && hoursUntilShow <= 24) multiplier += 0.1;
        if (multiplier > 1.3) multiplier = 1.3;

        const finalTicketPrice = Math.round(basePrice * multiplier);
        const totalPrice = (finalTicketPrice * seatNumbers.length) + 30; // Includes ₹30 fee

        // SECURITY FIX 1 (Cont.): Block transaction if backend price differs from frontend price
        if (expectedPrice && totalPrice !== expectedPrice) {
            return res.status(409).json({ 
                message: `Price Update: Due to real-time high demand, the grand total has surged to ₹${totalPrice}. Please refresh to accept the new price.` 
            });
        }

        const newBooking = new Booking({
            user: userId,
            show: showId,
            seatNumbers,
            totalPrice,
            status: 'Confirmed'
        });

        await newBooking.save();

        show.availableSeats -= seatNumbers.length;
        await show.save();

        res.status(201).json({ message: "Booking confirmed successfully!", booking: newBooking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { userId } = req.body;

        const booking = await Booking.findById(bookingId).populate('show');
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (userId && booking.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You do not own this ticket." });
        }

        if (booking.status === 'Cancelled') return res.status(400).json({ message: "Booking is already cancelled" });

        if (booking.show) {
            const showDateTime = new Date(`${booking.show.date}T${booking.show.time}:00+05:30`);
            if (showDateTime < new Date()) {
                return res.status(400).json({ message: "Tickets cannot be cancelled after the show has started." });
            }
        }

        booking.status = 'Cancelled';
        await booking.save();

        // ACCOUNTING FIX: Mark associated payment as Refunded
        await Payment.findOneAndUpdate(
            { booking: bookingId, status: 'Success' },
            { status: 'Refunded' }
        );

        if (booking.show) {
            const show = await Show.findById(booking.show._id);
            show.availableSeats += booking.seatNumbers.length;
            await show.save();
        }

        res.status(200).json({ message: "Booking cancelled and refund initiated!", booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ user: userId })
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title genre language posterUrl' },
                    { path: 'theater', select: 'name location' }
                ]
            })
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookedSeatsByShow = async (req, res) => {
    try {
        const { showId } = req.params;
        const bookings = await Booking.find({ show: showId, status: 'Confirmed' });
        const occupiedSeats = bookings.reduce((acc, booking) => acc.concat(booking.seatNumbers), []);
        res.status(200).json(occupiedSeats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};