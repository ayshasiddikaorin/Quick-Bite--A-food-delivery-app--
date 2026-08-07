/** Response shape for GET /admin/stats */
export interface PlatformStatsDTO {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalRiders: number;
  totalRestaurants: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  onDeliveryOrders: number;
  totalRevenue: number;
  weeklyOrderData: number[];
}
