/** Payload for POST /offers (seller creates an offer) */
export interface CreateOfferDTO {
  title: string;
  description?: string;
  discount: number;       // 1–100
  image?: string;
  bgColor?: string;
  validUntil: string;     // ISO date string
}
