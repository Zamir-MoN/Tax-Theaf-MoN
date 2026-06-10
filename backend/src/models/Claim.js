import mongoose from 'mongoose';

const claimSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'working', 'not_working'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Claim = mongoose.model('Claim', claimSchema);

export default Claim;
