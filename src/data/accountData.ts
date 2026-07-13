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

export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItemData[];
}

export interface MenuItemData {
  id: string;
  label: string;
  icon: string;
  iconBg: string;
  badge?: string;
  isDestructive?: boolean;
}

export const userProfile: UserProfile = {
  id: 'u_001',
  name: 'Aysha Siddika Orin',
  email: 'ayshasiddika.study@gmail.com',
  phone: '01312939830',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
  memberSince: 'Member since Jan 2023',
  totalOrders: 47,
  loyaltyPoints: 1240,
  walletBalance: 24.5,
  isPremium: true,
};

export const menuGroups: MenuGroup[] = [
  {
    id: 'g1',
    title: 'My Activity',
    items: [
      {
        id: 'm1',
        label: 'My Orders',
        icon: 'receipt-outline',
        iconBg: '#FFF0E6',
        badge: '3',
      },
      {
        id: 'm2',
        label: 'Favorites',
        icon: 'heart-outline',
        iconBg: '#FFE8E8',
        badge: '12',
      },
      {
        id: 'm3',
        label: 'Delivery Addresses',
        icon: 'location-outline',
        iconBg: '#E8F4FF',
      },
      {
        id: 'm4',
        label: 'Rewards & Coupons',
        icon: 'gift-outline',
        iconBg: '#F0E8FF',
        badge: 'NEW',
      },
    ],
  },
  {
    id: 'g2',
    title: 'Account',
    items: [
      {
        id: 'm5',
        label: 'Settings',
        icon: 'settings-outline',
        iconBg: '#F0F0F5',
      },
      {
        id: 'm6',
        label: 'Notifications',
        icon: 'notifications-outline',
        iconBg: '#FFF8E6',
        badge: '5',
      },
      {
        id: 'm7',
        label: 'Invite Friends',
        icon: 'people-outline',
        iconBg: '#E8FFF0',
      },
    ],
  },
  {
    id: 'g3',
    title: 'Support',
    items: [
      {
        id: 'm8',
        label: 'Help Center',
        icon: 'help-circle-outline',
        iconBg: '#E8F4FF',
      },
      {
        id: 'm9',
        label: 'Terms & Privacy',
        icon: 'shield-checkmark-outline',
        iconBg: '#F0F0F5',
      },
      {
        id: 'm10',
        label: 'About App',
        icon: 'information-circle-outline',
        iconBg: '#F0F5FF',
      },
    ],
  },
];
