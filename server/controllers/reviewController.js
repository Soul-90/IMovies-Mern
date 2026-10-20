const Review = require('../models/Review');

// Submit a review and rating
exports.addReview = async (req, res) => {
    try {
        const { movieId, userId, rating, comment } = req.body;

        if (!comment || !rating) {
            return res.status(400).json({ message: "Rating and comment are required" });
        }

        const newReview = new Review({
            movie: movieId,
            user: userId,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({ message: "Review submitted successfully!", review: newReview });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all reviews for a specific movie
exports.getMovieReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ movie: req.params.movieId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};