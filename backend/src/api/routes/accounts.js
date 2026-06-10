import express from 'express';
import Account from '../../models/Account.js';
import Log from '../../models/Log.js';
import Claim from '../../models/Claim.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/accounts
// @desc    Get all accounts with claim statistics
router.get('/', protect, async (req, res) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const accounts = await Account.find(query).sort({ createdAt: -1 }).lean();
    
    const accountIds = accounts.map(a => a._id);
    const claims = await Claim.find({ accountId: { $in: accountIds } });
    
    const enrichedAccounts = accounts.map(account => {
      const accountClaims = claims.filter(c => c.accountId.toString() === account._id.toString());
      const working = accountClaims.filter(c => c.reviewStatus === 'working').length;
      const notWorking = accountClaims.filter(c => c.reviewStatus === 'not_working').length;
      
      return {
        ...account,
        totalClaims: accountClaims.length,
        working,
        notWorking
      };
    });

    res.json(enrichedAccounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/accounts
// @desc    Create a new account
router.post('/', protect, async (req, res) => {
  const { gameName, username, password, imageUrl } = req.body;

  try {
    const account = await Account.create({
      gameName,
      username,
      password,
      imageUrl,
    });

    await Log.create({
      action: 'account_added',
      details: `Added new account for game: ${gameName}`,
      userId: req.admin.email,
    });

    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/accounts/:id
// @desc    Update an account
router.put('/:id', protect, async (req, res) => {
  const { gameName, username, password, imageUrl, status } = req.body;

  try {
    const account = await Account.findById(req.params.id);

    if (account) {
      account.gameName = gameName || account.gameName;
      account.username = username || account.username;
      account.password = password || account.password;
      account.imageUrl = imageUrl || account.imageUrl;
      account.status = status || account.status;

      const updatedAccount = await account.save();

      await Log.create({
        action: 'account_edited',
        details: `Edited account ${account._id} (Game: ${account.gameName})`,
        userId: req.admin.email,
      });

      res.json(updatedAccount);
    } else {
      res.status(404).json({ message: 'Account not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/accounts/:id
// @desc    Delete an account
router.delete('/:id', protect, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (account) {
      await account.deleteOne();
      
      await Log.create({
        action: 'account_deleted',
        details: `Deleted account ${account._id} (Game: ${account.gameName})`,
        userId: req.admin.email,
      });

      res.json({ message: 'Account removed' });
    } else {
      res.status(404).json({ message: 'Account not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
