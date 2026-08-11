/**
 * User domain models — mirrors backend IUser and AuthResponseDTO.
 */

export type UserRole = 'buyer' | 'seller' | 'rider' | 'admin';

/** In-memory / persisted session user — populated after login or /auth/me */
export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  isPremium: boolean;
  loyaltyPoints: number;
  walletBalance: number;
  totalOrders: number;
  memberSince: string;  // ISO date string
  restaurantName?: string;
  vehicleType?: string;
  isActive?: boolean;   // only present in admin list/toggle responses
}
