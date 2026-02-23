const express = require('express');
const router = express.Router();
const { addReview, getMovieReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:movie_id', getMovieReviews);
router.post('/', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;