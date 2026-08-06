import { AppError } from '../../shared/errors/AppError';
import { MenuItemRepository } from './menuItem.repository';
import { IMenuItem } from './menuItem.model';
import { RestaurantRepository } from '../restaurants/restaurant.repository';

export class MenuItemService {
  constructor(
    private readonly repo: MenuItemRepository,
    private readonly restaurantRepo: RestaurantRepository,
  ) {}

  async getByRestaurant(restaurantId: string): Promise<IMenuItem[]> {
    return this.repo.findByRestaurant(restaurantId);
  }

  async getById(id: string): Promise<IMenuItem> {
    const item = await this.repo.findById(id);
    if (!item) throw new AppError('Menu item not found', 404);
    return item;
  }

  /** Seller: add a new menu item to their restaurant */
  async create(ownerId: string, data: Partial<IMenuItem>): Promise<IMenuItem> {
    const restaurant = await this.restaurantRepo.findByOwnerId(ownerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);
    if (!restaurant.isApproved) throw new AppError('Restaurant is not approved yet', 403);

    return this.repo.create({ ...data, restaurantId: restaurant._id as any });
  }

  /** Seller: update one of their menu items */
  async update(ownerId: string, itemId: string, data: Partial<IMenuItem>): Promise<IMenuItem> {
    await this.assertOwnership(ownerId, itemId);
    const updated = await this.repo.update(itemId, data);
    if (!updated) throw new AppError('Menu item not found', 404);
    return updated;
  }

  async toggleAvailability(ownerId: string, itemId: string): Promise<IMenuItem> {
    await this.assertOwnership(ownerId, itemId);
    const item = await this.repo.toggleAvailability(itemId);
    if (!item) throw new AppError('Menu item not found', 404);
    return item;
  }

  async delete(ownerId: string, itemId: string): Promise<void> {
    await this.assertOwnership(ownerId, itemId);
    await this.repo.delete(itemId);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async assertOwnership(ownerId: string, itemId: string): Promise<void> {
    const restaurant = await this.restaurantRepo.findByOwnerId(ownerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);

    const item = await this.repo.findById(itemId);
    if (!item) throw new AppError('Menu item not found', 404);
    if (String(item.restaurantId) !== String(restaurant._id)) {
      throw new AppError('You do not own this menu item', 403);
    }
  }
}
