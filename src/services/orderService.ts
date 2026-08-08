/**
 * orderService.ts
 * ───────────────
 * All order-related API calls, separated by role.
 * Types come from models/order.ts — no inline type declarations here.
 */
import { apiRequest } from './apiClient';
import type { Order, PlaceOrderPayload } from '../models/order';
import type { SellerStats } from '../models/dashboard';

// ── Buyer ──────────────────────────────────────────────────────────────────────

/** Place a new order. Requires buyer role. */
export function placeOrder(payload: PlaceOrderPayload): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

/** Get the logged-in buyer's order history. */
export function fetchMyOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders/my', {}, true);
}

/** Get a single order by id (any authenticated role). */
export function fetchOrderById(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`, {}, true);
}

/** Cancel a pending order. */
export function cancelOrder(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}/cancel`, { method: 'PATCH' }, true);
}

// ── Seller ─────────────────────────────────────────────────────────────────────

/** Get all orders for the seller's restaurant. */
export function fetchSellerOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders/seller', {}, true);
}

/** Get today's overview stats for the seller dashboard. */
export function fetchSellerStats(): Promise<SellerStats> {
  return apiRequest<SellerStats>('/orders/seller/stats', {}, true);
}

/** Advance an order to the next seller status (pending→confirmed→preparing→ready). */
export function advanceOrderSeller(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/seller/${id}/advance`, { method: 'PATCH' }, true);
}

// ── Rider ──────────────────────────────────────────────────────────────────────

/** Get all orders with status "ready" — available for pickup. */
export function fetchRiderAvailableOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders/rider/available', {}, true);
}

/** Get this rider's currently active deliveries. */
export function fetchRiderActiveOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders/rider/active', {}, true);
}

/** Accept a ready order for delivery (status: ready → on_the_way). */
export function acceptDelivery(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/rider/${id}/accept`, { method: 'PATCH' }, true);
}

/** Advance delivery to next rider status (on_the_way → delivered). */
export function advanceOrderRider(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/rider/${id}/advance`, { method: 'PATCH' }, true);
}

// ── Admin ──────────────────────────────────────────────────────────────────────

/** Get all orders, optionally filtered by status. */
export function adminFetchAllOrders(status?: string): Promise<Order[]> {
  const qs = status ? `?status=${status}` : '';
  return apiRequest<Order[]>(`/orders/admin/all${qs}`, {}, true);
}
