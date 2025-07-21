const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the .env file.');
}

exports.facebookLogin = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User authentication failed.' });
  }

  // Create a JWT for our application session
  const payload = {
    id: req.user.id,
    email: req.user.email,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Token valid for 7 days

  res.json({
    success: true,
    message: 'User authenticated successfully.',
    token: token, // Return the raw token, not "Bearer <token>"
    user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    }
  });
}; 