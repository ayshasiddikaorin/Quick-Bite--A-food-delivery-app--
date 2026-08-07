import mongoose, { Document, Schema } from 'mongoose';

export interface IRider extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  isOnline: boolean;
  isVerified: boolean;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number[];
}

const riderSchema = new Schema<IRider>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    vehicleType: { type: String, default: 'Motorcycle' },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    todayEarnings: { type: Number, default: 0 },
    weeklyEarnings: { type: [Number], default: [0, 0, 0, 0, 0, 0, 0] },
  },
  { timestamps: true },
);

export const Rider = mongoose.model<IRider>('Rider', riderSchema);
