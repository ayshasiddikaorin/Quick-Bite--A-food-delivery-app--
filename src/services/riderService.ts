import { apiRequest } from './apiClient';
import type { Rider } from '../models';

export interface RiderStats {
  newRequests: number;
  activeDeliveries: number;
  todayIncome: number;
  weeklyData: number[];
  isOnline: boolean;
}

export interface RiderEarnings {
  todayEarnings: number;
  weeklyEarnings: number[];
  totalEarnings: number;
  totalDeliveries: number;
}

/** Rider: ensure profile exists (call on first login) */
export function ensureRiderProfile(): Promise<Rider> {
  return apiRequest<Rider>('/riders/profile/ensure', { method: 'POST' }, true);
}

/** Rider: get own profile */
export function fetchRiderProfile(): Promise<Rider> {
  return apiRequest<Rider>('/riders/profile', {}, true);
}

/** Rider: toggle online/offline */
export function toggleOnline(): Promise<Rider> {
  return apiRequest<Rider>('/riders/profile/toggle-online', { method: 'PATCH' }, true);
}

/** Rider: get delivery history */
export function fetchDeliveryHistory(): Promise<object[]> {
  return apiRequest<object[]>('/riders/delivery-history', {}, true);
}

/** Rider: get earnings summary */
export function fetchEarnings(): Promise<RiderEarnings> {
  return apiRequest<RiderEarnings>('/riders/earnings', {}, true);
}

/** Rider: get dashboard stats */
export function fetchRiderStats(): Promise<RiderStats> {
  return apiRequest<RiderStats>('/riders/stats', {}, true);
}
