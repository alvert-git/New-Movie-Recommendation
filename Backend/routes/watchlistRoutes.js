const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware'); // Must be logged in

router.post('/', protect, watchlistController.addToWatchlist);
router.get('/', protect, watchlistController.getWatchlist);
router.delete('/:movie_id', protect, watchlistController.removeFromWatchlist);
router.get('/check/:movie_id', protect, watchlistController.checkWatchlistStatus);

module.exports = router;
