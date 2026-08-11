import { MenuGroup } from '../models';

export const menuGroups: MenuGroup[] = [
  {
    id: 'activity',
    title: 'My Activity',
    items: [
      {
        id: 'my-orders',
        label: 'My Orders',
        icon: 'receipt-outline',
        iconBg: '#FFF0E6',
      },
      {
        id: 'favorites',
        label: 'Favorites',
        icon: 'heart-outline',
        iconBg: '#FFE8E8',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'notifications-outline',
        iconBg: '#FFF8E6',
      },
    ],
  },
];