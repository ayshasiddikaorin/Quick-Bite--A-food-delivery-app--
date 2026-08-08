/**
 * restaurantService.ts
 * ────────────────────
 * All restaurant-related API calls, separated by role.
 */
import { apiRequest } from './apiClient';
import type { RestaurantSummary, Restaurant } from '../models/restaurant';

// ── Public ─────────────────────────────────────────────────────────────────────

/** Get all approved restaurants (home screen list). */
export function fetchRestaurants(): Promise<RestaurantSummary[]> {
  return apiRequest<RestaurantSummary[]>('/restaurants');
}

/** Get a single restaurant by id (without menu — fetch menu separately). */
export function fetchRestaurantById(id: string): Promise<RestaurantSummary> {
  return apiRequest<RestaurantSummary>(`/restaurants/${id}`);
}

// ── Seller ─────────────────────────────────────────────────────────────────────

/** Get the logged-in seller's own restaurant. */
export function fetchMyRestaurant(): Promise<Restaurant> {
  return apiRequest<Restaurant>('/restaurants/seller/me', {}, true);
}

/** Update the seller's restaurant details. */
export function updateMyRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
  return apiRequest<Restaurant>('/restaurants/seller/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}

/** Toggle the restaurant open / closed. */
export function toggleRestaurantOpen(): Promise<Restaurant> {
  return apiRequest<Restaurant>('/restaurants/seller/me/toggle-open', {
    method: 'PATCH',
  }, true);
}

// ── Admin ──────────────────────────────────────────────────────────────────────

/** Get all restaurants (approved + pending). */
export function adminFetchAllRestaurants(): Promise<Restaurant[]> {
  return apiRequest<Restaurant[]>('/restaurants/admin/all', {}, true);
}

/** Approve a pending restaurant. */
export function adminApproveRestaurant(id: string): Promise<Restaurant> {
  return apiRequest<Restaurant>(`/restaurants/admin/${id}/approve`, {
    method: 'PATCH',
  }, true);
}
