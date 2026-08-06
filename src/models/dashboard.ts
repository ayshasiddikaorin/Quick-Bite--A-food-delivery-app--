export interface SellerStats {
  newOrders: number;
  preparing: number;
  completed: number;
  totalSales: number;
  weeklyData: number[];
}

export interface RiderStats {
  newRequests: number;
  activeDeliveries: number;
  todayIncome: number;
  weeklyData: number[];
  isOnline: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalRestaurants: number;
  totalRiders: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  onDeliveryOrders: number;
  totalRevenue: number;
  weeklyOrderData: number[];
}
