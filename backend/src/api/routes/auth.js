import express from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Admin login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    res.json({
      email,
      token,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @route   GET /api/auth/me
// @desc    Verify session
router.get('/me', protect, (req, res) => {
  res.json({ email: req.admin.email });
});

export default router;
