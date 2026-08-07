export type UserRole = 'buyer' | 'seller' | 'rider' | 'admin';

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
  memberSince: string;        // ISO string from Date
  restaurantName?: string;
  vehicleType?: string;
}
