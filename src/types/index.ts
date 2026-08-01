// ─── User Roles ───────────────────────────────────────────────────────────────
export type UserRole = 'buyer' | 'seller' | 'rider' | 'admin';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  isPremium?: boolean;
  restaurantName?: string;  // seller only
  vehicleType?: string;     // rider only
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  name: string;
  restaurant: string;
  image: string;
  rating: number;
  price: number;
  quantity: number;
}

export interface PromoCode {
  code: string;
  discount: number;
}

// ─── Food / Menu ──────────────────────────────────────────────────────────────
export interface FoodItem {
  id: string;
  name: string;
  restaurant: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  category: string;
  isFavorite: boolean;
  deliveryTime: string;
  description?: string;
  calories?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isAvailable: boolean;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  riderId?: string;
  riderName?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Restaurant ───────────────────────────────────────────────────────────────
export interface Restaurant {
  id: string;
  name: string;
  ownerId: string;
  cuisine: string[];
  rating: number;
  totalOrders: number;
  image: string;
  address: string;
  isOpen: boolean;
  isApproved: boolean;
  deliveryTime: string;
}

// ─── Rider ────────────────────────────────────────────────────────────────────
export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  isOnline: boolean;
  rating: number;
  totalDeliveries: number;
  earnings: number;
  isVerified: boolean;
}

// ─── Offer / Banner ───────────────────────────────────────────────────────────
export interface OfferItem {
  id: string;
  title: string;
  description: string;
  discount: number;
  image: string;
  bgColor: string;
  validUntil: string;
}

export interface BannerItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  bgColor: string;
}

// ─── Seller dashboard stats ───────────────────────────────────────────────────
export interface SellerStats {
  newOrders: number;
  preparing: number;
  completed: number;
  totalSales: number;
  weeklyData: number[];
}

// ─── Rider dashboard stats ────────────────────────────────────────────────────
export interface RiderStats {
  newRequests: number;
  activeDeliveries: number;
  todayIncome: number;
  weeklyData: number[];
  isOnline: boolean;
}

// ─── Admin stats ──────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalRestaurants: number;
  totalRiders: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  onDeliveryOrders: number;
  totalRevenue: number;
  weeklyOrderData: number[];
}
