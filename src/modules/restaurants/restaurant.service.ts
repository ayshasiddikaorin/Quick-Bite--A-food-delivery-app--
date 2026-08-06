import { AppError } from '../../shared/errors/AppError';
import { RestaurantRepository } from './restaurant.repository';
import { IRestaurant } from './restaurant.model';
import { UserRepository } from '../users/user.repository';

export class RestaurantService {
  constructor(
    private readonly repo: RestaurantRepository,
    private readonly userRepo: UserRepository,
  ) {}

  /** Public: list all approved restaurants */
  async listApproved(): Promise<IRestaurant[]> {
    return this.repo.findApproved();
  }

  /** Admin: list all restaurants (pending + approved) */
  async listAll(): Promise<IRestaurant[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<IRestaurant> {
    const r = await this.repo.findById(id);
    if (!r) throw new AppError('Restaurant not found', 404);
    return r;
  }

  /** Seller: get own restaurant */
  async getMyRestaurant(ownerId: string): Promise<IRestaurant> {
    const r = await this.repo.findByOwnerId(ownerId);
    if (!r) throw new AppError('Restaurant not found', 404);
    return r;
  }

  /** Seller: create restaurant on first registration / onboarding */
  async create(ownerId: string, data: Partial<IRestaurant>): Promise<IRestaurant> {
    const owner = await this.userRepo.findById(ownerId);
    if (!owner) throw new AppError('Owner user not found', 404);

    const existing = await this.repo.findByOwnerId(ownerId);
    if (existing) throw new AppError('You already have a restaurant registered', 409);

    const restaurant = await this.repo.create({
      ...data,
      ownerId: owner._id as any,
      ownerName: owner.name,
    });

    // Link restaurant back to user
    await this.userRepo.update(String(owner._id), { restaurantId: restaurant._id as any });

    return restaurant;
  }

  /** Seller: update own restaurant */
  async update(ownerId: string, data: Partial<IRestaurant>): Promise<IRestaurant> {
    const r = await this.repo.findByOwnerId(ownerId);
    if (!r) throw new AppError('Restaurant not found', 404);

    const updated = await this.repo.update(String(r._id), data);
    if (!updated) throw new AppError('Update failed', 500);
    return updated;
  }

  /** Admin: approve restaurant */
  async approve(id: string): Promise<IRestaurant> {
    const r = await this.repo.approve(id);
    if (!r) throw new AppError('Restaurant not found', 404);
    return r;
  }

  /** Seller: toggle open/closed */
  async toggleOpen(ownerId: string): Promise<IRestaurant> {
    const r = await this.repo.findByOwnerId(ownerId);
    if (!r) throw new AppError('Restaurant not found', 404);

    const updated = await this.repo.toggleOpen(String(r._id));
    if (!updated) throw new AppError('Toggle failed', 500);
    return updated;
  }
}
