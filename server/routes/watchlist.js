const express = require('express');
const router = express.Router();
const { addToWatchlist, removeFromWatchlist, getUserWatchlist } = require('../controllers/watchlistController');

router.post('/add', addToWatchlist);
router.post('/remove', removeFromWatchlist);
router.get('/user/:userId', getUserWatchlist);

module.exports = router;