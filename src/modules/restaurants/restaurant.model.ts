import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  ownerName: string;
  coverImage: string;
  logo: string;
  cuisine: string[];
  rating: number;
  reviews: number;
  totalOrders: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: string;
  isOpen: boolean;
  isApproved: boolean;
  menuCategories: string[];
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: { type: String, required: true },
    coverImage: { type: String, default: '' },
    logo: { type: String, default: '' },
    cuisine: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    deliveryTime: { type: String, default: '30-45 min' },
    deliveryFee: { type: Number, default: 2.99 },
    minOrder: { type: Number, default: 5 },
    address: { type: String, default: '' },
    isOpen: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    menuCategories: [{ type: String }],
  },
  { timestamps: true },
);

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
