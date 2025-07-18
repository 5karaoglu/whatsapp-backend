const express = require('express');
const router = express.Router();
const credentialsController = require('../controllers/credentials.controller');
const authenticate = require('../middleware/authenticate');

// All routes in this file are protected and require a valid JWT
router.use(authenticate);

// GET /api/credentials - Get the current user's credentials
router.get('/', credentialsController.getCredentials);

// POST /api/credentials - Update the current user's credentials
router.post('/', credentialsController.updateCredentials);

module.exports = router; 