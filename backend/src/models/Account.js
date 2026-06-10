import mongoose from 'mongoose';

const accountSchema = mongoose.Schema(
  {
    gameName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'processing'],
      default: 'available',
    },
    claimedBy: {
      type: String,
      default: null,
    },
    claimedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model('Account', accountSchema);

export default Account;
