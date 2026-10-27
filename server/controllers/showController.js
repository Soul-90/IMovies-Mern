const Show = require('../models/Show');

// DYNAMIC PRICING ALGORITHM
const applyDynamicPricing = (show) => {
    const basePrice = show.ticketPrice;
    let multiplier = 1.0;

    const total = show.totalSeats || 60;
    const available = show.availableSeats;
    const occupancyRate = (total - available) / total;

    // Rule 1: Scarcity Surge
    if (occupancyRate >= 0.8) multiplier += 0.2;
    else if (occupancyRate >= 0.5) multiplier += 0.1;

    // Rule 2: Last-Minute Booking Surge
    const showDateTime = new Date(`${show.date}T${show.time}:00+05:30`);
    const now = new Date();
    const hoursUntilShow = (showDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilShow > 0 && hoursUntilShow <= 24) {
        multiplier += 0.1;
    }

    // Cap maximum surge at 30% above base price
    if (multiplier > 1.3) multiplier = 1.3;

    const showObj = show.toObject();
    showObj.originalPrice = basePrice;
    showObj.ticketPrice = Math.round(basePrice * multiplier);
    showObj.isSurgePricing = multiplier > 1.0;
    
    return showObj;
};

exports.getAllShows = async (req, res) => {
    try {
        const shows = await Show.find()
            .populate('movie')
            .populate('theater')
            .sort({ date: 1, time: 1 });

        // Apply algorithm before sending to client
        const dynamicShows = shows.map(applyDynamicPricing);
        res.status(200).json(dynamicShows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addShow = async (req, res) => {
    try {
        const newShow = new Show(req.body);
        await newShow.save();
        res.status(201).json({ message: "Show scheduled successfully!", show: newShow });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};