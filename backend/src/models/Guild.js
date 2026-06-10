import mongoose from 'mongoose';

const guildSchema = mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      unique: true,
    },
    guildName: {
      type: String,
      required: true,
    },
    authorizedRoleId: {
      type: String,
    },
    setupCode: {
      type: String,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Guild = mongoose.model('Guild', guildSchema);

export default Guild;
