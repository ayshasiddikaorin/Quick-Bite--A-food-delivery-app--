/**
 * restaurant.service.ts
 * ─────────────────────
 * Business logic for the Restaurant domain.
 * Depends on IRestaurantRepository and IUserRepository — not concrete classes.
 */
import { AppError } from '../../shared/errors/AppError';
import { IRestaurant } from './restaurant.model';
import { IRestaurantRepository } from './interfaces';
import { IUserRepository } from '../users/interfaces';
import { CreateRestaurantDTO, UpdateRestaurantDTO } from './dto';

export class RestaurantService {
  constructor(
    private readonly repo:     IRestaurantRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  // ── Public ─────────────────────────────────────────────────────────────────

  async listApproved(): Promise<IRestaurant[]> {
    return this.repo.findApproved();
  }

  async getById(id: string): Promise<IRestaurant> {
    const r = await this.repo.findById(id);
    if (!r) throw new AppError('Restaurant not found', 404);
    return r;
  }

  // ── Seller ─────────────────────────────────────────────────────────────────

  async getMyRestaurant(ownerId: string): Promise<IRestaurant> {
    const r = await this.repo.findByOwnerId(ownerId);
    if (!r) throw new AppError('Restaurant not found for this seller', 404);
    return r;
  }

  async create(ownerId: string, dto: CreateRestaurantDTO): Promise<IRestaurant> {
    const owner = await this.userRepo.findById(ownerId);
    if (!owner) throw new AppError('Owner user not found', 404);

    const existing = await this.repo.findByOwnerId(ownerId);
    if (existing) throw new AppError('You already have a restaurant registered', 409);

    const restaurant = await this.repo.create({
      ...dto,
      ownerId:   owner._id as any,
      ownerName: owner.name,
    });

    // Back-link so the user record knows their restaurant id
    await this.userRepo.update(String(owner._id), { restaurantId: restaurant._id as any });

    return restaurant;
  }

  async update(ownerId: string, dto: UpdateRestaurantDTO): Promise<IRestaurant> {
    const r = await this.repo.findByOwnerId(ownerId);
    if (!r) throw new AppError('Restaurant not found', 404);

    const updated = await this.repo.update(String(r._id), dto as any);
    if (!updated) throw new AppError('Update failed', 500);
    return updated;
  }

  async toggleOpen(ownerId: string): Promise<IRestaurant> {
    const r = await this.repo.findByOwnerId(ownerId);
    if (!r) throw new AppError('Restaurant not found', 404);

    const updated = await this.repo.toggleOpen(String(r._id));
    if (!updated) throw new AppError('Toggle failed', 500);
    return updated;
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  async listAll(): Promise<IRestaurant[]> {
    return this.repo.findAll();
  }

  async approve(id: string): Promise<IRestaurant> {
    const r = await this.repo.approve(id);
    if (!r) throw new AppError('Restaurant not found', 404);
    return r;
  }
}
