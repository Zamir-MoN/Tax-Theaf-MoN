import mongoose from 'mongoose';

const verificationCodeSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30, // Auto delete document after 30 seconds
    },
  }
);

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

export default VerificationCode;
