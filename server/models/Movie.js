const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    language: { type: String, required: true },
    duration: { type: String, default: '2h 00m' },
    cast: { type: String },
    rating: { type: Number, default: 4.5 },
    description: { type: String },
    posterUrl: { type: String }
}, { timestamps: true });

// ARCHITECTURE FIX: Cascading Deletes
movieSchema.pre('findOneAndDelete', async function(next) {
    const movieId = this.getQuery()['_id'];
    try {
        // Find all shows for this movie to delete their nested bookings
        const shows = await mongoose.model('Show').find({ movie: movieId });
        const showIds = shows.map(s => s._id);
        
        // Wipe all related records across collections
        await mongoose.model('Booking').deleteMany({ show: { $in: showIds } });
        await mongoose.model('Show').deleteMany({ movie: movieId });
        await mongoose.model('Review').deleteMany({ movie: movieId });
        await mongoose.model('Watchlist').deleteMany({ movie: movieId });
        
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Movie', movieSchema);