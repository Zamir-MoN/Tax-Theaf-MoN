import mongoose from 'mongoose';

const logSchema = mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['account_added', 'account_edited', 'account_deleted', 'account_claimed', 'guild_approved', 'guild_rejected', 'guild_setup'],
    },
    details: {
      type: String,
      required: true,
    },
    userId: {
      type: String, // Can be Discord ID or Admin ID
    },
    guildId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model('Log', logSchema);

export default Log;
