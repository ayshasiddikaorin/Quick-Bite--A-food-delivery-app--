/**
 * Order domain models — mirror the backend IOrder document.
 */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'on_the_way'
  | 'reached'
  | 'delivered'
  | 'cancelled';

export type DeliveryType = 'standard' | 'express';

export interface OrderItem {
  menuItemId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

/** Full order document returned by the backend */
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  riderId?: string;
  riderName?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  address: string;
  latitude?: number;
  longitude?: number;
  deliveryType: DeliveryType;
  paymentMethod: string;
  promoCode?: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload sent to POST /orders */
export interface PlaceOrderPayload {
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  address: string;
  latitude?: number;
  longitude?: number;
  deliveryType: DeliveryType;
  paymentMethod: string;
  promoCode?: string;
}
