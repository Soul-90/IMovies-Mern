const express = require('express');
const router = express.Router();
const { addShow, getAllShows } = require('../controllers/showController');

router.post('/add', addShow);
router.get('/', getAllShows);

module.exports = router;