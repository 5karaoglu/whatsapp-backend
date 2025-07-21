const jwt = require('jsonwebtoken');
const UserCredentials = require('../models/credentials.model');
require('dotenv').config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the .env file.');
}

exports.facebookLogin = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User authentication failed.' });
  }

  try {
    // Check if the user has credentials configured
    const credentials = await UserCredentials.findOne({ where: { userId: req.user.id } });

    // Key credentials to check for existence
    const hasRequiredCredentials = credentials && credentials.whatsapp_token && credentials.phone_number_id;

    if (!hasRequiredCredentials) {
      // User is authenticated with Facebook but hasn't set up API keys.
      // Do not issue a token. Inform the frontend.
      return res.status(403).json({ 
        success: false, 
        message: 'Authentication successful, but API credentials are not configured. Please provide them in the settings.',
        errorCode: 'CREDENTIALS_MISSING' 
      });
    }

    // Credentials exist, create and return a JWT for the session
    const payload = {
      id: req.user.id,
      email: req.user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'User authenticated successfully.',
      token: token,
      user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
      }
    });

  } catch (error) {
    console.error('Error during credential check in facebookLogin:', error);
    res.status(500).json({ success: false, message: 'An internal server error occurred during login.' });
  }
}; 