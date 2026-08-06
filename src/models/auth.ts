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

export interface LoginResponse {
  usertoken: string;
  name: string;
  role: UserRole;
}

export interface StoredAuth {
  token: string;
  user: AuthUser;
}
