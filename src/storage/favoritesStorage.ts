import AsyncStorage from '@react-native-async-storage/async-storage';
import { RestaurantSummary } from '../models';
import { getStoredAuth } from './authStorage';

/** Each user gets their own favorites bucket, keyed by userId. */
async function favoritesKey(): Promise<string> {
  const auth = await getStoredAuth();
  const uid = auth?.user?.userId ?? 'guest';
  return `QUICKBITE_FAVORITES_${uid}`;
}

function normalize(r: RestaurantSummary): RestaurantSummary {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    coverImage: r.coverImage,
    logo: r.logo,
    cuisine: r.cuisine,
    rating: r.rating,
    reviews: r.reviews,
    totalOrders: r.totalOrders,
    deliveryTime: r.deliveryTime,
    deliveryFee: r.deliveryFee,
    minOrder: r.minOrder,
    address: r.address,
    isOpen: r.isOpen,
    isApproved: r.isApproved,
    menuCategories: r.menuCategories,
  };
}

export const getFavorites = async (): Promise<RestaurantSummary[]> => {
  try {
    const raw = await AsyncStorage.getItem(await favoritesKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RestaurantSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const isFavorite = async (restaurantId: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some((r) => r.id === restaurantId);
};

/** Add/remove a restaurant from favorites. Returns the updated list. */
export const toggleFavorite = async (restaurant: RestaurantSummary): Promise<RestaurantSummary[]> => {
  const favorites = await getFavorites();
  const existingIdx = favorites.findIndex((r) => r.id === restaurant.id);
  let updated: RestaurantSummary[];

  if (existingIdx >= 0) {
    updated = favorites.filter((r) => r.id !== restaurant.id);
  } else {
    updated = [normalize(restaurant), ...favorites];
  }

  await AsyncStorage.setItem(await favoritesKey(), JSON.stringify(updated));
  return updated;
};

export const removeFavorite = async (restaurantId: string): Promise<RestaurantSummary[]> => {
  const favorites = await getFavorites();
  const updated = favorites.filter((r) => r.id !== restaurantId);
  await AsyncStorage.setItem(await favoritesKey(), JSON.stringify(updated));
  return updated;
};