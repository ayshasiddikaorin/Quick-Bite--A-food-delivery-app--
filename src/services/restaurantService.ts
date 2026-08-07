import { apiRequest } from './apiClient';
import type { RestaurantData } from '../models';

/** Public: fetch all approved restaurants */
export function fetchRestaurants(): Promise<RestaurantData[]> {
  return apiRequest<RestaurantData[]>('/restaurants');
}

/** Public: fetch a single restaurant with its menu */
export function fetchRestaurantById(id: string): Promise<RestaurantData> {
  return apiRequest<RestaurantData>(`/restaurants/${id}`);
}

/** Seller: get own restaurant */
export function fetchMyRestaurant(): Promise<RestaurantData> {
  return apiRequest<RestaurantData>('/restaurants/seller/me', {}, true);
}

/** Seller: update own restaurant */
export function updateMyRestaurant(data: Partial<RestaurantData>): Promise<RestaurantData> {
  return apiRequest<RestaurantData>('/restaurants/seller/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}

/** Seller: toggle open/closed */
export function toggleRestaurantOpen(): Promise<RestaurantData> {
  return apiRequest<RestaurantData>('/restaurants/seller/me/toggle-open', {
    method: 'PATCH',
  }, true);
}

/** Admin: list all restaurants */
export function adminFetchAllRestaurants(): Promise<RestaurantData[]> {
  return apiRequest<RestaurantData[]>('/restaurants/admin/all', {}, true);
}

/** Admin: approve a restaurant */
export function adminApproveRestaurant(id: string): Promise<RestaurantData> {
  return apiRequest<RestaurantData>(`/restaurants/admin/${id}/approve`, {
    method: 'PATCH',
  }, true);
}
