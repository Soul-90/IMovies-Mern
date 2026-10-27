const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/paymentController');

// Ensure processPayment is properly linked as the route handler
router.post('/process', processPayment);

module.exports = router;