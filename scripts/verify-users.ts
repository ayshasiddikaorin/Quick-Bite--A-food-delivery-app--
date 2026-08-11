import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/modules/users/user.model';

(async () => {
  await mongoose.connect(process.env.MONGO_URI!, { serverSelectionTimeoutMS: 10_000 });
  const emails = ['buyer@gmail.com', 'seller@gmail.com', 'rider@gmail.com', 'admin@gmail.com'];
  const users = await User.find({ email: { $in: emails } }).select('+password');
  for (const u of users) {
    const ok = await u.comparePassword('123456');
    console.log(`${u.email} | role: ${u.role} | active: ${u.isActive} | password matches: ${ok}`);
  }
  await mongoose.disconnect();
  process.exit(0);
})();