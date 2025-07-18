const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');

// Route for Facebook OAuth
// It expects a field `access_token` in the POST body
router.post(
  '/facebook',
  passport.authenticate('facebook-token', { session: false }),
  authController.facebookLogin
);

module.exports = router; 