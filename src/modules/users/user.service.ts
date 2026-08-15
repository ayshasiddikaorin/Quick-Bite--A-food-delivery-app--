/**
 * user.service.ts
 * ───────────────
 * Business logic only.
 * No HTTP concepts (Request/Response), no Mongoose imports.
 * Depends on IUserRepository interface, not the concrete class.
 */
import { AppError } from '../../shared/errors/AppError';
import { signToken } from '../../shared/utils/jwt';
import { IUser } from './user.model';
import { IUserRepository } from './interfaces';
import { IRestaurantRepository } from '../restaurants/interfaces';
import { IMenuItemRepository } from '../menuItems/interfaces';
import { IOfferRepository } from '../offers/interfaces';
import { IRiderRepository } from '../riders/interfaces';
import { IOrderRepository } from '../orders/interfaces';
import {
  RegisterDTO,
  LoginDTO,
  AuthResponseDTO,
  UpdateProfileDTO,
} from './dto';

export class UserService {
  constructor(
    private readonly repo: IUserRepository,
    private readonly restaurantRepo?: IRestaurantRepository,
    private readonly menuItemRepo?: IMenuItemRepository,
    private readonly offerRepo?: IOfferRepository,
    private readonly riderRepo?: IRiderRepository,
    private readonly orderRepo?: IOrderRepository,
  ) {}

  // ── Auth ───────────────────────────────────────────────────────────────────

  async register(dto: RegisterDTO): Promise<AuthResponseDTO> {
    const exists = await this.repo.findByEmail(dto.email);
    if (exists) throw new AppError('Email already in use', 409);

    const user = await this.repo.create({
      name:           dto.name,
      email:          dto.email,
      phone:          dto.phone,
      password:       dto.password,
      role:           dto.role,
      restaurantName: dto.restaurantName,
      vehicleType:    dto.vehicleType,
    });

    return this.toAuthResponse(signToken({ id: String(user._id), role: user.role }), user);
  }

  async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.repo.findByEmail(dto.email);
    if (!user)        throw new AppError('Invalid email or password', 401);
    if (!user.isActive) throw new AppError('Your account has been deactivated', 403);

    const match = await user.comparePassword(dto.password);
    if (!match) throw new AppError('Invalid email or password', 401);

    if (dto.role && user.role !== dto.role) {
      throw new AppError(`This account is registered as a ${user.role}`, 403);
    }

    return this.toAuthResponse(signToken({ id: String(user._id), role: user.role }), user);
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  async getProfile(id: string): Promise<IUser> {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDTO): Promise<IUser> {
    const user = await this.repo.update(id, dto);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  async listAll(roleFilter?: string): Promise<IUser[]> {
    if (roleFilter && roleFilter !== 'all') {
      return this.repo.findByRole(roleFilter as IUser['role']);
    }
    return this.repo.findAll();
  }

  async toggleActive(id: string): Promise<IUser> {
    const user = await this.repo.toggleActive(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  /** Admin: permanently delete a user and all their related data (cascade). */
  async deleteUser(id: string): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'admin') throw new AppError('Admin accounts cannot be deleted', 403);

    // Find the user's restaurant (for sellers).
    const restaurant = this.restaurantRepo ? await this.restaurantRepo.findByOwnerId(id) : null;

    if (this.menuItemRepo && restaurant) {
      await this.menuItemRepo.deleteByRestaurant(String(restaurant._id));
    }
    if (this.offerRepo && restaurant) {
      // delete all offers belonging to that restaurant
      const offers = await this.offerRepo.findByRestaurant(String(restaurant._id));
      await Promise.all(offers.map((o) => this.offerRepo!.delete(String(o._id))));
    }
    if (this.restaurantRepo && restaurant) {
      await this.restaurantRepo.delete(String(restaurant._id));
    }
    if (this.riderRepo) {
      const rider = await this.riderRepo.findByUserId(id);
      if (rider) await this.riderRepo.deleteByUser(id);
    }
    if (this.orderRepo) {
      await this.orderRepo.deleteByCustomer(id);
    }

    await this.repo.hardDelete(id);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private toAuthResponse(usertoken: string, user: IUser): AuthResponseDTO {
    return {
      usertoken,
      userId:         String(user._id),
      name:           user.name,
      email:          user.email,
      phone:          user.phone,
      role:           user.role,
      avatar:         user.avatar,
      isPremium:      user.isPremium,
      loyaltyPoints:  user.loyaltyPoints,
      walletBalance:  user.walletBalance,
      totalOrders:    user.totalOrders,
      memberSince:    user.memberSince,
      restaurantName: user.restaurantName,
      vehicleType:    user.vehicleType,
    };
  }
}
