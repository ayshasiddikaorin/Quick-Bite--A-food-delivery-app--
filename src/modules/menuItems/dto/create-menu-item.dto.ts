/** Payload for POST /menu-items (seller adds an item) */
export interface CreateMenuItemDTO {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  isPopular?: boolean;
  discount?: number;
}
