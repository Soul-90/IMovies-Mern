const express = require('express');
const router = express.Router();
const { createBooking, cancelBooking, getUserBookings } = require('../controllers/bookingController');

router.post('/create', createBooking);
router.put('/cancel/:bookingId', cancelBooking);
router.get('/user/:userId', getUserBookings);

module.exports = router;