const express = require('express');
const router = express.Router();
const { createBooking, cancelBooking, getUserBookings, getBookedSeatsByShow } = require('../controllers/bookingController');

router.post('/create', createBooking);
router.put('/cancel/:bookingId', cancelBooking);
router.get('/user/:userId', getUserBookings);
router.get('/show/:showId', getBookedSeatsByShow); // <-- New endpoint

module.exports = router;