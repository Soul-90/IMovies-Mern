const Booking = require('../models/Booking');
const Show = require('../models/Show');

// Reserve tickets with seat numbers
exports.createBooking = async (req, res) => {
    try {
        const { userId, showId, seatNumbers } = req.body;

        if (!seatNumbers || seatNumbers.length === 0) {
            return res.status(400).json({ message: "Please select at least one seat" });
        }

        const show = await Show.findById(showId);
        if (!show) return res.status(404).json({ message: "Show not found" });

        if (show.availableSeats < seatNumbers.length) {
            return res.status(400).json({ message: "Not enough seats available" });
        }

        // Calculate total bill including taxes
        const ticketTotal = show.ticketPrice * seatNumbers.length;
        const convenienceFee = 30;
        const totalPrice = ticketTotal + convenienceFee;

        const newBooking = new Booking({
            user: userId,
            show: showId,
            seatNumbers,
            totalPrice
        });

        await newBooking.save();

        // Reduce available seat count
        show.availableSeats -= seatNumbers.length;
        await show.save();

        res.status(201).json({ message: "Booking confirmed!", booking: newBooking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cancel an existing booking
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        // Return seats back to the show
        const show = await Show.findById(booking.show);
        if (show) {
            show.availableSeats += booking.seatNumbers.length;
            await show.save();
        }

        booking.status = 'Cancelled';
        await booking.save();

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Fetch bookings for user
exports.getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ user: userId })
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title genre' },
                    { path: 'theater', select: 'name location' }
                ]
            });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};