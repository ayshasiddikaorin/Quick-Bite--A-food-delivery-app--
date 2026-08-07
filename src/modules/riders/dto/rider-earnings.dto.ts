/** Response shape for GET /riders/earnings */
export interface RiderEarningsDTO {
  todayEarnings: number;
  weeklyEarnings: number[];
  totalEarnings: number;
  totalDeliveries: number;
}
