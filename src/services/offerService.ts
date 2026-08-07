import { apiRequest } from './apiClient';
import type { OfferItem } from '../models';

/** Public: fetch active offers */
export function fetchActiveOffers(): Promise<OfferItem[]> {
  return apiRequest<OfferItem[]>('/offers');
}

/** Public: fetch offers by restaurant */
export function fetchOffersByRestaurant(restaurantId: string): Promise<OfferItem[]> {
  return apiRequest<OfferItem[]>(`/offers/restaurant/${restaurantId}`);
}

/** Seller: create an offer */
export function createOffer(data: Partial<OfferItem>): Promise<OfferItem> {
  return apiRequest<OfferItem>('/offers', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}

/** Seller: update an offer */
export function updateOffer(id: string, data: Partial<OfferItem>): Promise<OfferItem> {
  return apiRequest<OfferItem>(`/offers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}

/** Seller: delete an offer */
export function deleteOffer(id: string): Promise<void> {
  return apiRequest<void>(`/offers/${id}`, { method: 'DELETE' }, true);
}
