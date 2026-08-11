/**
 * Auth request/response models — used by authService and AuthContext.
 */
import { AuthUser, UserRole } from './user';

/** POST /auth/login payload */
export interface LoginRequest {
  email: string;
  password: string;
  role?: UserRole;  // optional role hint — must match registered role
}

/** POST /auth/register payload */
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  restaurantName?: string;
  vehicleType?: string;
}

/**
 * Shape returned by both /auth/login and /auth/register (inside the data envelope).
 * Contains the JWT plus all user fields — avoids an extra /auth/me round-trip.
 */
export interface LoginResponse {
  usertoken: string;
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
  memberSince: string;
  restaurantName?: string;
  vehicleType?: string;
}

/** What gets persisted in AsyncStorage */
export interface StoredAuth {
  token: string;
  user: AuthUser;
}
