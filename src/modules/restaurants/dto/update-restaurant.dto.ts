/** Payload for PATCH /restaurants/seller/me */
export interface UpdateRestaurantDTO {
  name?: string;
  coverImage?: string;
  logo?: string;
  cuisine?: string[];
  deliveryTime?: string;
  deliveryFee?: number;
  minOrder?: number;
  address?: string;
  menuCategories?: string[];
}
