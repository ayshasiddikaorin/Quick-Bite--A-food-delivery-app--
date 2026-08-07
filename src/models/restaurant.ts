import { RestaurantMenuItem } from './food';

export interface RestaurantData {
  id: string;
  name: string;
  coverImage: string;
  logo: string;
  cuisine: string[];
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: string;
  isOpen: boolean;
  menuCategories: string[];
  menu: RestaurantMenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  ownerId: string;
  cuisine: string[];
  rating: number;
  totalOrders: number;
  image: string;
  address: string;
  isOpen: boolean;
  isApproved: boolean;
  deliveryTime: string;
}
