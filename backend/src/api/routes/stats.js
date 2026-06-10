import express from 'express';
import Account from '../../models/Account.js';
import Guild from '../../models/Guild.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/stats
// @desc    Get dashboard statistics
router.get('/', protect, async (req, res) => {
  try {
    const totalAccounts = await Account.countDocuments();
    const availableAccounts = await Account.countDocuments({ status: 'available' });
    const claimedAccounts = await Account.countDocuments({ status: 'claimed' });
    const approvedServers = await Guild.countDocuments({ approved: true });

    res.json({
      totalAccounts,
      availableAccounts,
      claimedAccounts,
      approvedServers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
