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
      enum: ['available', 'disabled'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model('Account', accountSchema);

export default Account;
