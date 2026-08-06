import { IRestaurant, Restaurant } from './restaurant.model';

export class RestaurantRepository {
  async create(data: Partial<IRestaurant>): Promise<IRestaurant> {
    return Restaurant.create(data);
  }

  async findById(id: string): Promise<IRestaurant | null> {
    return Restaurant.findById(id);
  }

  async findByOwnerId(ownerId: string): Promise<IRestaurant | null> {
    return Restaurant.findOne({ ownerId });
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<IRestaurant[]> {
    return Restaurant.find(filter).sort({ createdAt: -1 });
  }

  async findApproved(): Promise<IRestaurant[]> {
    return Restaurant.find({ isApproved: true }).sort({ rating: -1 });
  }

  async update(id: string, data: Partial<IRestaurant>): Promise<IRestaurant | null> {
    return Restaurant.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async approve(id: string): Promise<IRestaurant | null> {
    return Restaurant.findByIdAndUpdate(id, { isApproved: true }, { new: true });
  }

  async toggleOpen(id: string): Promise<IRestaurant | null> {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return null;
    restaurant.isOpen = !restaurant.isOpen;
    return restaurant.save();
  }

  async delete(id: string): Promise<void> {
    await Restaurant.findByIdAndDelete(id);
  }

  async count(): Promise<number> {
    return Restaurant.countDocuments();
  }

  async countApproved(): Promise<number> {
    return Restaurant.countDocuments({ isApproved: true });
  }
}
