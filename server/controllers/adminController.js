const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

// Fetch aggregated stats for admin dashboard
exports.getAdminStats = async (req, res) => {
    try {
        const totalMovies = await Movie.countDocuments();
        const totalTheaters = await Theater.countDocuments();
        const totalShows = await Show.countDocuments();
        const totalBookings = await Booking.countDocuments();

        // Calculate total platform revenue from confirmed bookings
        const revenueResult = await Booking.aggregate([
            { $match: { status: 'Confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Get 5 most recent bookings across the platform
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title' },
                    { path: 'theater', select: 'name' }
                ]
            })
            .populate('user', 'username email');

        res.status(200).json({
            totalMovies,
            totalTheaters,
            totalShows,
            totalBookings,
            totalRevenue,
            recentBookings
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};