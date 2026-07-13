export interface CartItem {
  id: string;
  name: string;
  restaurant: string;
  rating: number;
  price: number;
  quantity: number;
  image: string;
}

export const cartItems: CartItem[] = [
  {
    id: '1',
    name: 'Classic Burger',
    restaurant: 'Burger House',
    rating: 4.8,
    price: 12.99,
    quantity: 2,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  },
  {
    id: '2',
    name: 'Chicken Pizza',
    restaurant: 'Pizza Hut',
    rating: 4.7,
    price: 15.99,
    quantity: 1,
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
  },
  {
    id: '3',
    name: 'Chicken Biryani',
    restaurant: 'Sultan Dine',
    rating: 4.9,
    price: 9.99,
    quantity: 1,
    image:
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
  },
];