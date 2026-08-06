import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description: string;
  discount: number;
  image: string;
  bgColor: string;
  validUntil: Date;
  restaurantId: mongoose.Types.ObjectId;
  restaurantName: string;
  isActive: boolean;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    discount: { type: Number, required: true, min: 1, max: 100 },
    image: { type: String, default: '' },
    bgColor: { type: String, default: '#FF6B00' },
    validUntil: { type: Date, required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    restaurantName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Offer = mongoose.model<IOffer>('Offer', offerSchema);
