import { IMenuItem, MenuItem } from './menuItem.model';
import { IMenuItemRepository } from './interfaces';

export class MenuItemRepository implements IMenuItemRepository {
  async create(data: Partial<IMenuItem>): Promise<IMenuItem> {
    return MenuItem.create(data);
  }

  async findById(id: string): Promise<IMenuItem | null> {
    return MenuItem.findById(id);
  }

  async findByRestaurant(restaurantId: string): Promise<IMenuItem[]> {
    return MenuItem.find({ restaurantId }).sort({ category: 1, name: 1 });
  }

  async findByRestaurantAndCategory(restaurantId: string, category: string): Promise<IMenuItem[]> {
    return MenuItem.find({ restaurantId, category });
  }

  async update(id: string, data: Partial<IMenuItem>): Promise<IMenuItem | null> {
    return MenuItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async toggleAvailability(id: string): Promise<IMenuItem | null> {
    const item = await MenuItem.findById(id);
    if (!item) return null;
    item.isAvailable = !item.isAvailable;
    return item.save();
  }

  async delete(id: string): Promise<void> {
    await MenuItem.findByIdAndDelete(id);
  }

  async deleteByRestaurant(restaurantId: string): Promise<void> {
    await MenuItem.deleteMany({ restaurantId });
  }
}
