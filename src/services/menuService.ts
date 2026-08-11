/**
 * menuService.ts
 * ──────────────
 * All menu item API calls.
 */
import { apiRequest, ApiError } from './apiClient';
import type { RestaurantMenuItem, MenuItem } from '../models/food';
import type { Restaurant } from '../models/restaurant';

// ── Public ─────────────────────────────────────────────────────────────────────

/** Get all menu items for a restaurant (used by RestaurantScreen). */
export function fetchMenuByRestaurant(restaurantId: string): Promise<RestaurantMenuItem[]> {
  return apiRequest<RestaurantMenuItem[]>(`/menu-items/restaurant/${restaurantId}`);
}

/**
 * Get the currently logged-in seller's own menu items.
 * Fetches the seller's restaurant first, then its menu.
 */
export async function fetchMyMenuItems(): Promise<MenuItem[]> {
  let restaurant: Restaurant;
  try {
    restaurant = await apiRequest<Restaurant>('/restaurants/seller/me', {}, true);
  } catch (err: unknown) {
    // Seller has no registered restaurant yet → nothing to list.
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
  return apiRequest<MenuItem[]>(`/menu-items/restaurant/${restaurant.id}`);
}

/** Get a single menu item by id. */
export function fetchMenuItemById(id: string): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${id}`);
}

// ── Seller ─────────────────────────────────────────────────────────────────────

/** Add a new menu item to the seller's restaurant. */
export function createMenuItem(data: Omit<MenuItem, 'id' | 'restaurantId'>): Promise<MenuItem> {
  return apiRequest<MenuItem>('/menu-items', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}

/** Update an existing menu item. */
export function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}

/** Toggle a menu item's availability (isAvailable). */
export function toggleMenuItemAvailability(id: string): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${id}/toggle`, { method: 'PATCH' }, true);
}

/** Delete a menu item permanently. */
export function deleteMenuItem(id: string): Promise<void> {
  return apiRequest<void>(`/menu-items/${id}`, { method: 'DELETE' }, true);
}
