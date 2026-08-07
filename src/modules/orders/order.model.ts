import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus, DeliveryType } from '../../shared/types';

export type { OrderStatus }; // re-export so existing imports still work

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  restaurantId: mongoose.Types.ObjectId;
  restaurantName: string;
  riderId?: mongoose.Types.ObjectId;
  riderName?: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  address: string;
  deliveryType: DeliveryType;
  paymentMethod: string;
  promoCode?: string;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    restaurantName: { type: String, required: true },
    riderId: { type: Schema.Types.ObjectId, ref: 'User' },
    riderName: { type: String },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'],
      default: 'pending',
    },
    address: { type: String, required: true },
    deliveryType: { type: String, enum: ['standard', 'express'] as DeliveryType[], default: 'standard' as DeliveryType },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    promoCode: { type: String },
  },
  { timestamps: true },
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
