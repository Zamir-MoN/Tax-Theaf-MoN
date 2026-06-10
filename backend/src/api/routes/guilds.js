import express from 'express';
import Guild from '../../models/Guild.js';
import Log from '../../models/Log.js';
import { protect } from '../middleware/auth.js';
import { client } from '../../index.js'; // to interact with discord bot instance if needed

const router = express.Router();

// @route   GET /api/guilds
// @desc    Get all guilds
router.get('/', protect, async (req, res) => {
  try {
    const guilds = await Guild.find({}).sort({ createdAt: -1 });
    res.json(guilds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/guilds/:id/approve
// @desc    Approve a guild
router.put('/:id/approve', protect, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);

    if (guild) {
      guild.approved = true;
      await guild.save();

      await Log.create({
        action: 'guild_approved',
        details: `Approved guild ${guild.guildName} (${guild.guildId})`,
        userId: req.admin.email,
        guildId: guild.guildId,
      });

      // Send message to discord server owner if possible
      try {
        if (client) {
          const discordGuild = await client.guilds.fetch(guild.guildId);
          if (discordGuild) {
            const owner = await discordGuild.fetchOwner();
            if (owner) {
              await owner.send(`Your server **${discordGuild.name}** has been successfully verified! You can now use all bot features.`);
            }
          }
        }
      } catch (err) {
        console.error("Failed to send approval DM to owner:", err.message);
      }

      res.json(guild);
    } else {
      res.status(404).json({ message: 'Guild not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/guilds/:id/reject
// @desc    Reject a guild (or delete)
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);

    if (guild) {
      guild.approved = false;
      await guild.save(); // or we could delete it

      await Log.create({
        action: 'guild_rejected',
        details: `Rejected guild ${guild.guildName} (${guild.guildId})`,
        userId: req.admin.email,
        guildId: guild.guildId,
      });

      res.json({ message: 'Guild rejected' });
    } else {
      res.status(404).json({ message: 'Guild not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/guilds/:id
// @desc    Delete a guild
router.delete('/:id', protect, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);

    if (guild) {
      await guild.deleteOne();
      res.json({ message: 'Guild removed' });
    } else {
      res.status(404).json({ message: 'Guild not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
