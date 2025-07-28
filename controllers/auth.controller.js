const jwt = require('jsonwebtoken');
const UserCredentials = require('../models/credentials.model');
require('dotenv').config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the .env file.');
}

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    profilePictureUrl: user.profilePictureUrl,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.facebookAuth = (req, res, next) => {
  passport.authenticate('facebook-token', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: err.message || 'An error occurred during Facebook authentication.' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
    const token = generateToken(user);
    res.json({ token });
  })(req, res, next);
}; 