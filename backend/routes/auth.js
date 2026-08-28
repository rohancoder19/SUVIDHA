const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { auth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'suvidha_secret_key_2026_super_secure';

// Helper: Password complexity check
const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return minLength && hasUpper && hasLower && hasNumber;
};

// Helper: Set HTTP-Only Cookie
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user with password validation & set HTTP-Only cookie
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, profile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'Citizen', // SECURITY: Public registration is strictly restricted to Citizens
      profile: profile || {}
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.profile
      },
      message: 'Account created successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & set HTTP-Only cookie
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      message: 'Logged in successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Invalidate session & clear HTTP-Only cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
router.get('/me', auth, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await PasswordReset.create({
        email: email.toLowerCase(),
        token: resetToken,
        expiresAt
      });
      // In production, send email with reset link: /reset-password/${resetToken}
    }

    // Generic response to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists for this email, password reset instructions have been generated.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using valid single-use token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || !validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long and contain uppercase, lowercase, and numbers.'
      });
    }

    const resetDoc = await PasswordReset.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
    if (!resetDoc) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
    }

    const user = await User.findOne({ email: resetDoc.email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    resetDoc.used = true;
    await resetDoc.save();

    res.json({ success: true, message: 'Password updated successfully. Please sign in.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
