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

export interface RestaurantMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  discount?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isAvailable: boolean;
}
