/**
 * Offer domain models — mirrors the backend IOffer document.
 */

/** Returned by GET /offers and GET /offers/:id */
export interface OfferItem {
  id: string;
  title: string;
  description: string;
  discount: number;
  image: string;
  bgColor: string;
  validUntil: string;       // ISO date string
  restaurantId: string;
  restaurantName: string;   // always present on backend response
  isActive: boolean;
}

/** Static promotional banner — client-only, not from backend */
export interface BannerItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  bgColor: string;
  restaurantId: string;
}

/** Local promo code entry */
export interface PromoCode {
  code: string;
  discount: number;
}
