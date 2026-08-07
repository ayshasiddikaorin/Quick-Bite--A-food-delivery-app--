import { DeliveryType } from '../../../shared/types';

export interface OrderItemDTO {
  menuItemId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

/** Payload for POST /orders (buyer places an order) */
export interface PlaceOrderDTO {
  restaurantId: string;
  restaurantName: string;
  items: OrderItemDTO[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  address: string;
  deliveryType: DeliveryType;
  paymentMethod: string;
  promoCode?: string;
}
