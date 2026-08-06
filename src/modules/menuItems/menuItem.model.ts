import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  discount: number;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    category: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    discount: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
