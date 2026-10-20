const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, email, password, role, adminSecret } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Verify Admin Secret Passcode if role is admin
        let assignedRole = 'user';
        if (role === 'admin') {
            if (adminSecret !== process.env.ADMIN_SECRET) {
                return res.status(403).json({ message: "Invalid Admin Secret Passcode!" });
            }
            assignedRole = 'admin';
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: assignedRole
        });

        await newUser.save();
        res.status(201).json({ message: `Registered successfully as ${assignedRole}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Login an existing user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT Token containing id, role, and username
        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username }, 
            "supersecretkey", 
            { expiresIn: "1d" }
        );

        res.status(200).json({ 
            token, 
            role: user.role, 
            username: user.username, 
            message: "Logged in successfully" 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};