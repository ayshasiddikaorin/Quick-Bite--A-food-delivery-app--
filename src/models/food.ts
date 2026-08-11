/**
 * Food / menu item models.
 *
 * FoodItem        — display card on home screen (derived from restaurant + menu data)
 * RecommendedItem — display card on recommended section
 * RestaurantMenuItem — raw item shape returned by GET /menu-items/restaurant/:id
 * MenuItem        — seller management view (includes isAvailable)
 */

/** Used by FoodCard and home screen popular/recommended lists */
export interface FoodItem {
  id: string;
  name: string;
  restaurantId: string;
  restaurant: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  category: string;
  isFavorite: boolean;
  deliveryTime: string;
  description?: string;
  calories?: number;
}

/** Used by RecommendedCard */
export interface RecommendedItem {
  id: string;
  name: string;
  restaurantId: string;
  restaurant: string;
  rating: number;
  price: number;
  image: string;
  deliveryTime: string;
  category: string;
  calories: number;
}

/** Shape returned by GET /menu-items/restaurant/:id — matches backend IMenuItem */
export interface RestaurantMenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  discount: number;
}

/** Seller management view (same as RestaurantMenuItem, alias for clarity) */
export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  discount: number;
}
