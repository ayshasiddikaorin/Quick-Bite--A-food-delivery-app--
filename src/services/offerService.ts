/**
 * offerService.ts
 * ───────────────
 * All offer-related API calls.
 */
import { apiRequest } from './apiClient';
import type { OfferItem } from '../models/offer';

// ── Public ─────────────────────────────────────────────────────────────────────

/** Get all currently active (non-expired) offers (home + offers screen). */
export function fetchActiveOffers(): Promise<OfferItem[]> {
  return apiRequest<OfferItem[]>('/offers');
}

/** Get all offers belonging to a specific restaurant. */
export function fetchOffersByRestaurant(restaurantId: string): Promise<OfferItem[]> {
  return apiRequest<OfferItem[]>(`/offers/restaurant/${restaurantId}`);
}

// ── Seller ─────────────────────────────────────────────────────────────────────

/** Create a new offer for the seller's restaurant. */
export function createOffer(data: {
  title: string;
  description?: string;
  discount: number;
  image?: string;
  bgColor?: string;
  validUntil: string;
}): Promise<OfferItem> {
  return apiRequest<OfferItem>('/offers', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}

/** Update an existing offer. */
export function updateOffer(id: string, data: Partial<OfferItem>): Promise<OfferItem> {
  return apiRequest<OfferItem>(`/offers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}

/** Delete an offer. */
export function deleteOffer(id: string): Promise<void> {
  return apiRequest<void>(`/offers/${id}`, { method: 'DELETE' }, true);
}
