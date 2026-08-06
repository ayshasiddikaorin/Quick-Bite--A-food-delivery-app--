import { apiRequest } from './apiClient';
import type { RestaurantMenuItem, MenuItem } from '../models';

/** Public: get all menu items for a restaurant */
export function fetchMenuByRestaurant(restaurantId: string): Promise<RestaurantMenuItem[]> {
  return apiRequest<RestaurantMenuItem[]>(`/menu-items/restaurant/${restaurantId}`);
}

/** Seller: add a new menu item */
export function createMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
  return apiRequest<MenuItem>('/menu-items', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}

/** Seller: update a menu item */
export function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}

/** Seller: toggle item availability */
export function toggleMenuItemAvailability(id: string): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${id}/toggle`, { method: 'PATCH' }, true);
}

/** Seller: delete a menu item */
export function deleteMenuItem(id: string): Promise<void> {
  return apiRequest<void>(`/menu-items/${id}`, { method: 'DELETE' }, true);
}
