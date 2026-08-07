/**
 * admin.service.ts
 * ────────────────
 * Platform-wide aggregation logic.
 * Depends on repository interfaces — not concrete classes.
 */
import { IUserRepository } from '../users/interfaces';
import { IRestaurantRepository } from '../restaurants/interfaces';
import { IOrderRepository } from '../orders/interfaces';
import { IRiderRepository } from '../riders/interfaces';
import { PlatformStatsDTO } from './dto';

export class AdminService {
  constructor(
    private readonly userRepo:       IUserRepository,
    private readonly restaurantRepo: IRestaurantRepository,
    private readonly orderRepo:      IOrderRepository,
    private readonly riderRepo:      IRiderRepository,
  ) {}

  async getPlatformStats(): Promise<PlatformStatsDTO> {
    const [
      userCounts,
      totalRestaurants,
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      onDeliveryOrders,
      totalRevenue,
      weeklyOrderData,
    ] = await Promise.all([
      this.userRepo.countByRole(),
      this.restaurantRepo.count(),
      this.orderRepo.count(),
      this.orderRepo.count({ status: 'delivered' }),
      this.orderRepo.count({ status: 'pending' }),
      this.orderRepo.count({ status: 'cancelled' }),
      this.orderRepo.count({ status: 'on_the_way' }),
      this.orderRepo.totalRevenue(),
      this.orderRepo.weeklyOrderCounts(),
    ]);

    return {
      totalUsers:       (userCounts['buyer'] ?? 0) + (userCounts['seller'] ?? 0) + (userCounts['rider'] ?? 0),
      totalBuyers:      userCounts['buyer']  ?? 0,
      totalSellers:     userCounts['seller'] ?? 0,
      totalRiders:      userCounts['rider']  ?? 0,
      totalRestaurants,
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      onDeliveryOrders,
      totalRevenue,
      weeklyOrderData,
    };
  }
}
