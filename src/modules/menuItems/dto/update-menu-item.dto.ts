/** Payload for PATCH /menu-items/:id */
export interface UpdateMenuItemDTO {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  discount?: number;
}
