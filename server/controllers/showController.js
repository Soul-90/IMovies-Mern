const Show = require('../models/Show');

// Add a new show (Admin)
exports.addShow = async (req, res) => {
    try {
        const { date, time } = req.body;

        // Check if scheduled date/time is in the past
        const selectedDateTime = new Date(`${date}T${time}`);
        const currentDateTime = new Date();

        if (selectedDateTime < currentDateTime) {
            return res.status(400).json({ message: "Cannot schedule a show in the past!" });
        }

        const newShow = new Show(req.body);
        await newShow.save();
        res.status(201).json(newShow);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all shows with Movie and Theater details attached
exports.getAllShows = async (req, res) => {
    try {
        const shows = await Show.find()
            .populate('movie', 'title genre')
            .populate('theater', 'name location');
        res.status(200).json(shows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};