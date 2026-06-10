import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Claim from './models/Claim.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/giveaway', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  const result = await Claim.deleteMany({});
  console.log(`Deleted ${result.deletedCount} claims! You are now unstuck.`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
