const Theater = require('../models/Theater');

// Add a new theater
exports.addTheater = async (req, res) => {
    try {
        const newTheater = new Theater(req.body);
        await newTheater.save();
        res.status(201).json(newTheater);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all theaters
exports.getAllTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find();
        res.status(200).json(theaters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};