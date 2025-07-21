const jwt = require('jsonwebtoken');
const UserCredentials = require('../models/credentials.model');
require('dotenv').config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the .env file.');
}

exports.facebookLogin = async (req, res) => {
  // By the time this controller is called, passport.js has already:
  // 1. Authenticated the user with Facebook.
  // 2. Fetched and saved all necessary WhatsApp API credentials.
  // 3. Attached the user object to req.user.
  // We just need to issue the JWT.
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User authentication failed.' });
  }

  try {
    const payload = {
      id: req.user.id,
      email: req.user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'User authenticated and credentials configured successfully.',
      token: token,
      user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
      }
    });

  } catch (error) {
    console.error('Error in facebookLogin while issuing JWT:', error);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}; 