/** Payload for POST /restaurants (seller creates their restaurant) */
export interface CreateRestaurantDTO {
  name: string;
  coverImage?: string;
  logo?: string;
  cuisine?: string[];
  deliveryTime?: string;
  deliveryFee?: number;
  minOrder?: number;
  address?: string;
  menuCategories?: string[];
}
