/**
 * Restaurant domain models.
 *
 * RestaurantSummary  — what GET /restaurants (list) returns
 * RestaurantDetail   — what GET /restaurants/:id returns (same fields, no menu — menu comes from /menu-items)
 * RestaurantWithMenu — client-side assembled shape used by RestaurantScreen
 * Restaurant         — admin/seller view with approval/owner fields
 */
import { RestaurantMenuItem } from './food';

/** Shape returned by GET /restaurants and GET /restaurants/:id */
export interface RestaurantSummary {
  id: string;
  name: string;
  coverImage: string;
  logo: string;
  cuisine: string[];
  rating: number;
  reviews: number;
  totalOrders: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: string;
  isOpen: boolean;
  isApproved: boolean;
  menuCategories: string[];
}

/**
 * Client-side shape used by RestaurantScreen.
 * menu is populated locally after fetching /menu-items/restaurant/:id.
 * Extends RestaurantSummary so existing screens keep working.
 */
export interface RestaurantData extends RestaurantSummary {
  menu: RestaurantMenuItem[];  // assembled client-side from menuService
}

/** Admin/seller view with ownership info */
export interface Restaurant {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  cuisine: string[];
  rating: number;
  reviews: number;
  totalOrders: number;
  coverImage: string;
  logo: string;
  address: string;
  isOpen: boolean;
  isApproved: boolean;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  menuCategories: string[];
}
