const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');

router.post('/facebook', (req, res, next) => {
  passport.authenticate('facebook-token', { session: false }, (err, user, info) => {
    if (err) {
      // These are the custom errors we are throwing from the passport strategy
      // (e.g., "No phone numbers found...") and other potential errors.
      console.error('Authentication Strategy Error:', err.message);
      // Return a user-friendly error message to the frontend.
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!user) {
      // This case might happen if `done(null, false)` is called.
      return res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
    }
    // If authentication is successful, manually attach the user to the request object
    // and proceed to the login controller to issue a JWT.
    req.user = user;
    return authController.facebookLogin(req, res, next);
  })(req, res, next);
});

module.exports = router; 