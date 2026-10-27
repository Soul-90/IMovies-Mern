const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    screens: { type: Number, default: 1 }
}, { timestamps: true });

// ARCHITECTURE FIX: Cascading Deletes
theaterSchema.pre('findOneAndDelete', async function(next) {
    const theaterId = this.getQuery()['_id'];
    try {
        const shows = await mongoose.model('Show').find({ theater: theaterId });
        const showIds = shows.map(s => s._id);
        
        await mongoose.model('Booking').deleteMany({ show: { $in: showIds } });
        await mongoose.model('Show').deleteMany({ theater: theaterId });
        
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Theater', theaterSchema);