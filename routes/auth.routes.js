const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');

// This route will be hit by the frontend with the Facebook access token
router.post('/facebook', authController.facebookAuth);

module.exports = router; 