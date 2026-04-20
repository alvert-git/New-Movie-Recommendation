const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Need to check if this exists or use a similar middleware

router.post('/interaction', protect, userController.logInteraction);
router.get('/dashboard', protect, userController.getDashboardData);

module.exports = router;
