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
}

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

export interface RecommendedItem {
  id: string;
  name: string;
  restaurant: string;
  rating: number;
  price: number;
  image: string;
  deliveryTime: string;
  category: string;
  calories: number;
}

export const banners: BannerItem[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    title: 'Big Burger Deal',
    subtitle: 'Get 30% off on all burgers today!',
    bgColor: '#FF6B35',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    title: 'Pizza Fiesta',
    subtitle: 'Free delivery on orders above $20',
    bgColor: '#E85520',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    title: 'Sushi Night',
    subtitle: 'Premium sushi at special prices',
    bgColor: '#FF8C5A',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    title: 'Healthy Bowls',
    subtitle: 'Eat fresh, stay healthy!',
    bgColor: '#4CAF50',
  },
];

export const popularFoods: FoodItem[] = [
  {
    id: '1',
    name: 'Classic Smash Burger',
    restaurant: 'Burger Republic',
    rating: 4.8,
    reviews: 320,
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    category: 'Burgers',
    isFavorite: true,
    deliveryTime: '20-30 min',
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    restaurant: 'Pizza Palace',
    rating: 4.7,
    reviews: 215,
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    category: 'Pizza',
    isFavorite: false,
    deliveryTime: '25-35 min',
  },
  {
    id: '3',
    name: 'Dragon Roll Sushi',
    restaurant: 'Tokyo Garden',
    rating: 4.9,
    reviews: 410,
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80',
    category: 'Sushi',
    isFavorite: true,
    deliveryTime: '30-40 min',
  },
  {
    id: '4',
    name: 'Chicken Tacos',
    restaurant: 'Taco Loco',
    rating: 4.6,
    reviews: 178,
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
    category: 'Mexican',
    isFavorite: false,
    deliveryTime: '15-25 min',
  },
  {
    id: '5',
    name: 'Pad Thai Noodles',
    restaurant: 'Thai Orchid',
    rating: 4.7,
    reviews: 289,
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    category: 'Thai',
    isFavorite: false,
    deliveryTime: '25-35 min',
  },
];

export const offers: OfferItem[] = [
  {
    id: '1',
    title: 'Weekend Special',
    description: 'Get extra savings on your weekend orders',
    discount: 25,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    bgColor: '#FF6B35',
    validUntil: 'Today Only',
  },
  {
    id: '2',
    title: 'Pizza Combo',
    description: 'Buy any large pizza, get a free drink',
    discount: 40,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
    bgColor: '#E85520',
    validUntil: 'Ends Sunday',
  },
  {
    id: '3',
    title: 'Healthy Monday',
    description: 'All salads and healthy bowls discounted',
    discount: 20,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    bgColor: '#4CAF50',
    validUntil: 'Mon & Tue',
  },
];

export const recommendedFoods: RecommendedItem[] = [
  {
    id: '1',
    name: 'Truffle Mushroom Pasta',
    restaurant: 'La Bella Italia',
    rating: 4.9,
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    deliveryTime: '20-30 min',
    category: 'Pasta',
    calories: 520,
  },
  {
    id: '2',
    name: 'Spicy Ramen Bowl',
    restaurant: 'Ramen House',
    rating: 4.8,
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    deliveryTime: '25-35 min',
    category: 'Japanese',
    calories: 680,
  },
  {
    id: '3',
    name: 'BBQ Ribs Platter',
    restaurant: 'Smokehouse Grill',
    rating: 4.7,
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    deliveryTime: '35-45 min',
    category: 'BBQ',
    calories: 890,
  },
  {
    id: '4',
    name: 'Avocado Buddha Bowl',
    restaurant: 'Green Garden',
    rating: 4.6,
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    deliveryTime: '15-25 min',
    category: 'Healthy',
    calories: 420,
  },
];
