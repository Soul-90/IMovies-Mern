const express = require('express');
const router = express.Router();
const { addReview, getMovieReviews } = require('../controllers/reviewController');

router.post('/add', addReview);
router.get('/movie/:movieId', getMovieReviews);

module.exports = router;