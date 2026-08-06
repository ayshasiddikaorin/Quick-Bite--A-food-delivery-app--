import { AuthUser, UserRole } from './user';

export interface LoginRequest {
  email: string;
  password: string;
  role?: UserRole;
}

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
 * Shape returned by both /auth/login and /auth/register.
 * The backend puts all user fields plus the JWT in the data envelope.
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

export interface StoredAuth {
  token: string;
  user: AuthUser;
}
