const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Must be logged in

const verifyAdmin = require('../middleware/adminMiddleware');

router.post('/initiate', protect, paymentController.initiatePayment);
router.post('/verify', protect, paymentController.verifyPayment);
router.get('/access/:movie_id', protect, paymentController.checkAccess);

// Admin Routes
router.get('/earnings', protect, verifyAdmin, paymentController.getEarnings);

module.exports = router;
