import { apiRequest } from './apiClient';
import type { Order } from '../models';

export interface PlaceOrderPayload {
  restaurantId: string;
  restaurantName: string;
  items: {
    menuItemId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  address: string;
  deliveryType: 'standard' | 'express';
  paymentMethod: string;
  promoCode?: string;
}

/** Buyer: place a new order */
export function placeOrder(payload: PlaceOrderPayload): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

/** Buyer: get own order history */
export function fetchMyOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders/my', {}, true);
}

/** Buyer/all: get a single order by id */
export function fetchOrderById(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`, {}, true);
}

/** Buyer: cancel an order */
export function cancelOrder(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}/cancel`, { method: 'PATCH' }, true);
}

/** Seller: get restaurant orders */
export function fetchSellerOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders/seller', {}, true);
}

/** Seller: advance order to next status */
export function advanceOrderSeller(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/seller/${id}/advance`, { method: 'PATCH' }, true);
}

/** Rider: get available (ready) orders */
export function fetchRiderAvailableOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders/rider/available', {}, true);
}

/** Rider: get own active deliveries */
export function fetchRiderActiveOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders/rider/active', {}, true);
}

/** Rider: accept a delivery */
export function acceptDelivery(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/rider/${id}/accept`, { method: 'PATCH' }, true);
}

/** Rider: advance delivery to next step */
export function advanceOrderRider(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/rider/${id}/advance`, { method: 'PATCH' }, true);
}

/** Admin: get all orders (optional status filter) */
export function adminFetchAllOrders(status?: string): Promise<Order[]> {
  const qs = status ? `?status=${status}` : '';
  return apiRequest<Order[]>(`/orders/admin/all${qs}`, {}, true);
}
