/** Response shape for GET /orders/seller/stats */
export interface SellerStatsDTO {
  newOrders: number;   // pending + confirmed
  preparing: number;   // preparing + ready
  completed: number;   // delivered
  totalSales: number;  // sum of total on delivered orders
  weeklyData: number[]; // 7-element array, Mon→Sun order count
}
