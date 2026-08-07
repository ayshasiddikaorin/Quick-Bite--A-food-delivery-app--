/**
 * Shape returned by both /auth/register and /auth/login.
 * Contains the JWT plus all user fields the client needs
 * immediately after authentication — avoids a second /me round-trip.
 */
export interface AuthResponseDTO {
  usertoken: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  isPremium: boolean;
  loyaltyPoints: number;
  walletBalance: number;
  totalOrders: number;
  memberSince: Date;
  restaurantName?: string;
  vehicleType?: string;
}
