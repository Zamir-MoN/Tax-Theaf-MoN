import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
   try {
       await mongoose.connection.collection('verificationcodes').dropIndex('createdAt_1');
       console.log('Successfully dropped the 30-second TTL index.');
   } catch (e) {
       console.log('Index might not exist or already dropped.', e.message);
   }
   process.exit(0);
});
