/**
 * menuItem.service.ts
 * ───────────────────
 * Business logic for menu items.
 * Depends on IMenuItemRepository and IRestaurantRepository — not concrete classes.
 */
import { AppError } from '../../shared/errors/AppError';
import { IMenuItem } from './menuItem.model';
import { IMenuItemRepository } from './interfaces';
import { IRestaurantRepository } from '../restaurants/interfaces';
import { CreateMenuItemDTO, UpdateMenuItemDTO } from './dto';

export class MenuItemService {
  constructor(
    private readonly repo:           IMenuItemRepository,
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  // ── Public ─────────────────────────────────────────────────────────────────

  async getByRestaurant(restaurantId: string): Promise<IMenuItem[]> {
    return this.repo.findByRestaurant(restaurantId);
  }

  async getById(id: string): Promise<IMenuItem> {
    const item = await this.repo.findById(id);
    if (!item) throw new AppError('Menu item not found', 404);
    return item;
  }

  // ── Seller ─────────────────────────────────────────────────────────────────

  async create(ownerId: string, dto: CreateMenuItemDTO): Promise<IMenuItem> {
    const restaurant = await this.restaurantRepo.findByOwnerId(ownerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);
    if (!restaurant.isApproved) throw new AppError('Restaurant is not approved yet', 403);

    return this.repo.create({ ...dto, restaurantId: restaurant._id as any });
  }

  async update(ownerId: string, itemId: string, dto: UpdateMenuItemDTO): Promise<IMenuItem> {
    await this.assertOwnership(ownerId, itemId);
    const updated = await this.repo.update(itemId, dto as any);
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
