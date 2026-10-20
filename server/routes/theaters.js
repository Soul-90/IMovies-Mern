const express = require('express');
const router = express.Router();
const { addTheater, getAllTheaters } = require('../controllers/theaterController');

router.post('/add', addTheater);
router.get('/', getAllTheaters);

module.exports = router;