/**
 * Account/profile UI models — used by the buyer account screen.
 * UserProfile is derived from AuthUser for display purposes.
 */

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

/** Single item in the account menu list */
export interface MenuItemData {
  id: string;
  label: string;
  icon: string;
  iconBg: string;
  badge?: string;
  isDestructive?: boolean;
}

/** Group of account menu items (e.g. "My Activity", "Support") */
export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItemData[];
}
