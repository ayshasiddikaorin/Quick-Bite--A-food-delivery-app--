/** Payload for PATCH /offers/:id */
export interface UpdateOfferDTO {
  title?: string;
  description?: string;
  discount?: number;
  image?: string;
  bgColor?: string;
  validUntil?: string;
  isActive?: boolean;
}
