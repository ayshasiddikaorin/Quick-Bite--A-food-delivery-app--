/**
 * rider.service.ts
 * ────────────────
 * Business logic for the Rider domain.
 * Depends on IRiderRepository, IUserRepository, IOrderRepository.
 */
import { AppError } from '../../shared/errors/AppError';
import { IRider } from './rider.model';
import { IRiderRepository } from './interfaces';
import { IUserRepository } from '../users/interfaces';
import { IOrderRepository } from '../orders/interfaces';
import { RiderStatsDTO, RiderEarningsDTO } from './dto';

export class RiderService {
  constructor(
    private readonly repo:      IRiderRepository,
    private readonly userRepo:  IUserRepository,
    private readonly orderRepo: IOrderRepository,
  ) {}

  /** Idempotent: creates a rider profile if one doesn't exist yet. */
  async ensureProfile(userId: string): Promise<IRider> {
    const existing = await this.repo.findByUserId(userId);
    if (existing) return existing;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    return this.repo.create({
      userId:      user._id as any,
      name:        user.name,
      email:       user.email,
      phone:       user.phone,
      vehicleType: user.vehicleType ?? 'Motorcycle',
    });
  }

  async getProfile(userId: string): Promise<IRider> {
    const rider = await this.repo.findByUserId(userId);
    if (!rider) throw new AppError('Rider profile not found', 404);
    return rider;
  }

  async toggleOnline(userId: string): Promise<IRider> {
    const rider = await this.repo.toggleOnline(userId);
    if (!rider) throw new AppError('Rider profile not found', 404);
    return rider;
  }

  async getDeliveryHistory(userId: string): Promise<IRider['_id'] extends never ? never : object[]> {
    await this.getProfile(userId); // validate exists
    const orders = await this.orderRepo.findByRider(userId);
    return orders.filter((o) => o.status === 'delivered') as any;
  }

  async getEarnings(userId: string): Promise<RiderEarningsDTO> {
    const rider = await this.getProfile(userId);
    return {
      todayEarnings:    rider.todayEarnings,
      weeklyEarnings:   rider.weeklyEarnings,
      totalEarnings:    rider.totalEarnings,
      totalDeliveries:  rider.totalDeliveries,
    };
  }

  async getStats(userId: string): Promise<RiderStatsDTO> {
    const rider = await this.getProfile(userId);

    const [activeOrders, readyOrders] = await Promise.all([
      this.orderRepo.findByRider(userId),
      this.orderRepo.findByStatus('ready'),
    ]);

    return {
      newRequests:       readyOrders.length,
      activeDeliveries:  activeOrders.filter((o) =>
        ['assigned', 'on_the_way', 'reached'].includes(o.status),
      ).length,
      todayIncome:       rider.todayEarnings,
      weeklyData:        rider.weeklyEarnings,
      isOnline:          rider.isOnline,
    };
  }

  async listAll(): Promise<IRider[]> {
    return this.repo.findAll();
  }
}
