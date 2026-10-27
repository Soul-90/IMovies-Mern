const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Show = require('../models/Show');

exports.getAdminStats = async (req, res) => {
    try {
        const totalMovies = await Movie.countDocuments();
        const totalTheaters = await Theater.countDocuments();
        const totalShows = await Show.countDocuments();
        
        const allBookings = await Booking.find()
            .populate('user', 'username email')
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title' },
                    { path: 'theater', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        const totalBookings = allBookings.length;

        // BUG FIX: Calculate Net Revenue only from Confirmed bookings
        const totalRevenue = allBookings
            .filter(booking => booking.status === 'Confirmed')
            .reduce((sum, booking) => sum + booking.totalPrice, 0);

        res.status(200).json({
            totalMovies,
            totalTheaters,
            totalShows,
            totalBookings,
            totalRevenue,
            recentBookings: allBookings.slice(0, 15) // Send latest 15 transactions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};