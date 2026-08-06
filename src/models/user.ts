export type UserRole = 'buyer' | 'seller' | 'rider' | 'admin';

export interface AuthUser {
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatar?: string;
  isPremium?: boolean;
  restaurantName?: string;
  vehicleType?: string;
}
