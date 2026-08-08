/**
 * Dashboard stat shapes — one per role.
 * These mirror the backend DTO responses exactly so there are no silent mismatches.
 */

/** Returned by GET /orders/seller/stats */
export interface SellerStats {
  newOrders: number;    // pending + confirmed
  preparing: number;    // preparing + ready
  completed: number;    // delivered
  totalSales: number;
  weeklyData: number[]; // 7-element Mon→Sun order counts
}

/** Returned by GET /riders/stats */
export interface RiderStats {
  newRequests: number;
  activeDeliveries: number;
  todayIncome: number;
  weeklyData: number[];
  isOnline: boolean;
}

/** Returned by GET /admin/stats */
export interface AdminStats {
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
