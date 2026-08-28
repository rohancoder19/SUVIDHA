const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'suvidha_secret_key_2026_super_secure';

const auth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-Only Cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // 2. Fallback to Authorization Header
    else if (req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')) {
      token = req.header('Authorization').split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No active session found. Please sign in to access SUVIDHA.' }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User session is invalid or user was removed.' }
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Your session has expired. Please sign in again.' }
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')) {
      token = req.header('Authorization').split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (err) {
    // Optional auth fallback
  }
  next();
};

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Access denied. Requires ${roles.join(' or ')} permission.` }
      });
    }
    next();
  };
};

module.exports = { auth, optionalAuth, requireRole };
