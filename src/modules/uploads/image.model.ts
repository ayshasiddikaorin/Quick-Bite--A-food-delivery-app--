import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  data: Buffer;
  mimeType: string;
  size: number;
  originalExt: string;
}

const imageSchema = new Schema<IImage>(
  {
    data: { type: Buffer, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    originalExt: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Image = mongoose.model<IImage>('Image', imageSchema);
