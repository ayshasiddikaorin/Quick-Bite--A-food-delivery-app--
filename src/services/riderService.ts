/**
 * riderService.ts
 * ───────────────
 * All rider-related API calls.
 */
import { apiRequest } from './apiClient';
import type { Rider } from '../models/rider';
import type { Order } from '../models/order';
import type { RiderStats } from '../models/dashboard';

export interface RiderEarnings {
  todayEarnings: number;
  weeklyEarnings: number[];
  totalEarnings: number;
  totalDeliveries: number;
}

/**
 * Idempotent — creates a rider profile if one doesn't exist yet.
 * Call once after the rider's first login.
 */
export function ensureRiderProfile(): Promise<Rider> {
  return apiRequest<Rider>('/riders/profile/ensure', { method: 'POST' }, true);
}

/** Get the logged-in rider's full profile. */
export function fetchRiderProfile(): Promise<Rider> {
  return apiRequest<Rider>('/riders/profile', {}, true);
}

/** Toggle the rider's online / offline status. */
export function toggleOnline(): Promise<Rider> {
  return apiRequest<Rider>('/riders/profile/toggle-online', { method: 'PATCH' }, true);
}

/** Get the rider's completed delivery history. */
export function fetchDeliveryHistory(): Promise<Order[]> {
  return apiRequest<Order[]>('/riders/delivery-history', {}, true);
}

/** Get earnings breakdown (today, weekly, total, deliveries count). */
export function fetchEarnings(): Promise<RiderEarnings> {
  return apiRequest<RiderEarnings>('/riders/earnings', {}, true);
}

/** Get dashboard stats (new requests, active deliveries, today's income). */
export function fetchRiderStats(): Promise<RiderStats> {
  return apiRequest<RiderStats>('/riders/stats', {}, true);
}
