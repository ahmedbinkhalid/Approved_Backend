const jwt = require('jsonwebtoken');
const userModel = require('../Models/user'); // Adjust the path if necessary
require('dotenv').config();

const JWT_SECRET = process.env.secretKey;

/**
 * Middleware for verifying JWT and attaching user info to the request
 */
authMiddleware = async (req, res, next) => {
  try {
    // Check for the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Authorization denied.' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the user details to the request object
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      profilePicture: user.profilePicture
    };

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ message: 'Token is invalid or expired. Authorization denied.' });
  }
};

module.exports = {
  authMiddleware,
};
