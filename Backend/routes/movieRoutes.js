const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// This matches the '/api/movies' path you defined in server.js
router.get('/', movieController.getAllMovies);
router.get('/search', movieController.searchMovies);
router.get('/recommend', movieController.getRecommendations);
router.get('/:id', movieController.getMovieById);

// Admin Routes
router.post('/', protect, verifyAdmin, upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'backdrop', maxCount: 1 }]), movieController.createMovie);
router.put('/:id', protect, verifyAdmin, upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'backdrop', maxCount: 1 }]), movieController.updateMovie);
router.delete('/:id', protect, verifyAdmin, movieController.deleteMovie);

module.exports = router;