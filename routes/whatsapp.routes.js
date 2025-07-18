const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');
const authenticate = require('../middleware/authenticate');

// Protect all routes in this file
router.use(authenticate);

// --- Message Routes ---
// POST /api/whatsapp/send-message
router.post('/send-message', whatsappController.sendMessage);

// --- Template Routes ---
// POST /api/whatsapp/templates
router.post('/templates', whatsappController.createTemplate);

// GET /api/whatsapp/templates
router.get('/templates', whatsappController.getTemplates);

module.exports = router; 