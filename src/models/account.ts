export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  totalOrders: number;
  loyaltyPoints: number;
  walletBalance: number;
  isPremium: boolean;
}

export interface MenuItemData {
  id: string;
  label: string;
  icon: string;
  iconBg: string;
  badge?: string;
  isDestructive?: boolean;
}

export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItemData[];
}
