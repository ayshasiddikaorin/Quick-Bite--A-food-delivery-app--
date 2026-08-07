import { IMenuItem } from '../menuItem.model';

export interface IMenuItemRepository {
  create(data: Partial<IMenuItem>): Promise<IMenuItem>;
  findById(id: string): Promise<IMenuItem | null>;
  findByRestaurant(restaurantId: string): Promise<IMenuItem[]>;
  findByRestaurantAndCategory(restaurantId: string, category: string): Promise<IMenuItem[]>;
  update(id: string, data: Partial<IMenuItem>): Promise<IMenuItem | null>;
  toggleAvailability(id: string): Promise<IMenuItem | null>;
  delete(id: string): Promise<void>;
  deleteByRestaurant(restaurantId: string): Promise<void>;
}
