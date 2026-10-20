const express = require('express');
const router = express.Router();
const { processPayment, getPaymentByBooking } = require('../controllers/paymentController');

router.post('/process', processPayment);
router.get('/booking/:bookingId', getPaymentByBooking);

module.exports = router;