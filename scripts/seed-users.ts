import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/modules/users/user.model';
import { connectDB } from '../src/shared/db/connect';

const USERS = [
  { name: 'Buyer Demo',    email: 'buyer@gmail.com',  phone: '01700000001', password: '123456', role: 'buyer'  as const },
  { name: 'Seller Demo',   email: 'seller@gmail.com', phone: '01700000002', password: '123456', role: 'seller' as const, restaurantName: 'Quick Bite Kitchen' },
  { name: 'Rider Demo',    email: 'rider@gmail.com',  phone: '01700000003', password: '123456', role: 'rider'  as const, vehicleType: 'Motorcycle' },
  { name: 'Admin Demo',    email: 'admin@gmail.com',  phone: '01700000004', password: '123456', role: 'admin'  as const },
];

async function seed() {
  await connectDB();

  for (const data of USERS) {
    await User.findOneAndDelete({ email: data.email });
    const user = await User.create(data);
    console.log(`Created ${user.role}: ${user.email} (${user._id})`);
  }

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });