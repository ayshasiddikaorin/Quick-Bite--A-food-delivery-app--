/**
 * Rider domain model — mirrors the backend IRider document.
 */
export interface Rider {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  isOnline: boolean;
  isVerified: boolean;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number[];  // 7-element Mon→Sun
}
