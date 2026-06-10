import express from 'express';
import Log from '../../models/Log.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/logs
// @desc    Get all logs
router.get('/', protect, async (req, res) => {
  try {
    const logs = await Log.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
