import { AppError } from '../../shared/errors/AppError';
import { RiderRepository } from './rider.repository';
import { IRider } from './rider.model';
import { UserRepository } from '../users/user.repository';
import { OrderRepository } from '../orders/order.repository';

export class RiderService {
  constructor(
    private readonly repo: RiderRepository,
    private readonly userRepo: UserRepository,
    private readonly orderRepo: OrderRepository,
  ) {}

  /** Called during registration or first login for riders */
  async ensureProfile(userId: string): Promise<IRider> {
    const existing = await this.repo.findByUserId(userId);
    if (existing) return existing;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    return this.repo.create({
      userId: user._id as any,
      name: user.name,
      email: user.email,
      phone: user.phone,
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

  async getDeliveryHistory(userId: string): Promise<object[]> {
    const rider = await this.repo.findByUserId(userId);
    if (!rider) throw new AppError('Rider profile not found', 404);
    const orders = await this.orderRepo.findByRider(userId);
    return orders.filter((o) => o.status === 'delivered');
  }

  async getEarnings(userId: string): Promise<object> {
    const rider = await this.repo.findByUserId(userId);
    if (!rider) throw new AppError('Rider profile not found', 404);
    return {
      todayEarnings: rider.todayEarnings,
      weeklyEarnings: rider.weeklyEarnings,
      totalEarnings: rider.totalEarnings,
      totalDeliveries: rider.totalDeliveries,
    };
  }

  async getStats(userId: string): Promise<object> {
    const rider = await this.repo.findByUserId(userId);
    if (!rider) throw new AppError('Rider profile not found', 404);

    const activeDeliveries = await this.orderRepo.findByRider(userId).then((orders) =>
      orders.filter((o) => o.status === 'on_the_way').length,
    );
    const newRequests = await this.orderRepo.findByStatus('ready').then((o) => o.length);

    return {
      newRequests,
      activeDeliveries,
      todayIncome: rider.todayEarnings,
      weeklyData: rider.weeklyEarnings,
      isOnline: rider.isOnline,
    };
  }

  async listAll(): Promise<IRider[]> {
    return this.repo.findAll();
  }
}
