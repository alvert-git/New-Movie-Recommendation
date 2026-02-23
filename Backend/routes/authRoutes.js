const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Local Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Initial request to Google
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false // Disable session for JWT
}));

// Google redirects back to this URL
router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/login', 
        session: false // Disable session for JWT
    }),
    authController.googleCallback
);

router.get('/logout', authController.logout);

module.exports = router;