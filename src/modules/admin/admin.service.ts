import { UserRepository } from '../users/user.repository';
import { RestaurantRepository } from '../restaurants/restaurant.repository';
import { OrderRepository } from '../orders/order.repository';
import { RiderRepository } from '../riders/rider.repository';

export class AdminService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly restaurantRepo: RestaurantRepository,
    private readonly orderRepo: OrderRepository,
    private readonly riderRepo: RiderRepository,
  ) {}

  async getPlatformStats(): Promise<object> {
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
      totalUsers: (userCounts['buyer'] ?? 0) + (userCounts['seller'] ?? 0) + (userCounts['rider'] ?? 0),
      totalBuyers: userCounts['buyer'] ?? 0,
      totalSellers: userCounts['seller'] ?? 0,
      totalRiders: userCounts['rider'] ?? 0,
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

  async getSellerStats(sellerId: string, restaurantId: string): Promise<object> {
    const [newOrders, preparing, completed, salesResult] = await Promise.all([
      this.orderRepo.count({ restaurantId, status: 'pending' }),
      this.orderRepo.count({ restaurantId, status: 'preparing' }),
      this.orderRepo.count({ restaurantId, status: 'delivered' }),
      this.orderRepo.totalRevenue(),
    ]);

    return { newOrders, preparing, completed, totalSales: salesResult };
  }
}
