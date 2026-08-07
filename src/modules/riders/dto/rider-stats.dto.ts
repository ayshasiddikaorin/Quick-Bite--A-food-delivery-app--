/** Response shape for GET /riders/stats */
export interface RiderStatsDTO {
  newRequests: number;       // orders in 'ready' status
  activeDeliveries: number;  // orders assigned to this rider with status 'on_the_way'
  todayIncome: number;
  weeklyData: number[];      // 7-element earnings array
  isOnline: boolean;
}
