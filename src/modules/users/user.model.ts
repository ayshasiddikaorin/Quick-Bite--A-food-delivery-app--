import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../../shared/types';

export type { UserRole };  // re-export for backward compat

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  avatar: string;
  isActive: boolean;
  isPremium: boolean;
  loyaltyPoints: number;
  walletBalance: number;
  totalOrders: number;
  memberSince: Date;
  restaurantName?: string;
  restaurantId?: mongoose.Types.ObjectId;
  vehicleType?: string;
  riderId?: mongoose.Types.ObjectId;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name:           { type: String,  required: true, trim: true },
    email:          { type: String,  required: true, unique: true, lowercase: true, trim: true },
    phone:          { type: String,  required: true, trim: true },
    password:       { type: String,  required: true, minlength: 6, select: false },
    role:           { type: String,  enum: ['buyer', 'seller', 'rider', 'admin'], default: 'buyer' },
    avatar:         { type: String,  default: '' },
    isActive:       { type: Boolean, default: true },
    isPremium:      { type: Boolean, default: false },
    loyaltyPoints:  { type: Number,  default: 0 },
    walletBalance:  { type: Number,  default: 0 },
    totalOrders:    { type: Number,  default: 0 },
    memberSince:    { type: Date,    default: Date.now },
    restaurantName: { type: String },
    restaurantId:   { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    vehicleType:    { type: String },
    riderId:        { type: Schema.Types.ObjectId, ref: 'Rider' },
  },
  { timestamps: true },
);

// Hash password before save — Mongoose 9 supports async middleware without next()
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  (this as IUser).password = await bcrypt.hash((this as IUser).password, 12);
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
