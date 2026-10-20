const Watchlist = require('../models/Watchlist');

// Add movie to watchlist
exports.addToWatchlist = async (req, res) => {
    try {
        const { userId, movieId } = req.body;

        const existing = await Watchlist.findOne({ user: userId, movie: movieId });
        if (existing) {
            return res.status(400).json({ message: "Movie is already in your watchlist" });
        }

        const newItem = new Watchlist({ user: userId, movie: movieId });
        await newItem.save();

        res.status(201).json({ message: "Added to Watchlist!", item: newItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Remove movie from watchlist
exports.removeFromWatchlist = async (req, res) => {
    try {
        const { userId, movieId } = req.body;
        await Watchlist.findOneAndDelete({ user: userId, movie: movieId });
        res.status(200).json({ message: "Removed from Watchlist!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user's saved watchlist
exports.getUserWatchlist = async (req, res) => {
    try {
        const items = await Watchlist.find({ user: req.params.userId }).populate('movie');
        // Extract array of populated movie objects
        const movies = items.map(item => item.movie).filter(movie => movie !== null);
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};