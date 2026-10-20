const express = require('express');
const router = express.Router();
const { getAllMovies, addMovie } = require('../controllers/movieController');

router.get('/', getAllMovies);
router.post('/add', addMovie);

module.exports = router;