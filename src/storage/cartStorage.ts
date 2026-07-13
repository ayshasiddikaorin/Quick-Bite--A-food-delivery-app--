import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../types/cart';

const CART_KEY = 'FOODIGO_CART';

// Get Cart
export const getCart = async (): Promise<CartItem[]> => {
  try {
    const data = await AsyncStorage.getItem(CART_KEY);

    if (data) {
      return JSON.parse(data);
    }

    return [];
  } catch (error) {
    console.log('Get Cart Error:', error);
    return [];
  }
};

// Save Cart
export const saveCart = async (cart: CartItem[]) => {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.log('Save Cart Error:', error);
  }
};

// Add Item
export const addToCart = async (item: CartItem) => {
  const cart = await getCart();

  const existing = cart.find(i => i.id === item.id);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  await saveCart(cart);
};

// Remove Item
export const removeFromCart = async (id: string) => {
  const cart = await getCart();

  const updated = cart.filter(item => item.id !== id);

  await saveCart(updated);
};

// Increase Quantity
export const increaseQuantity = async (id: string) => {
  const cart = await getCart();

  const updated = cart.map(item =>
    item.id === id
      ? { ...item, quantity: item.quantity + 1 }
      : item
  );

  await saveCart(updated);
};

// Decrease Quantity
export const decreaseQuantity = async (id: string) => {
  const cart = await getCart();

  const updated = cart
    .map(item =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity > 1 ? item.quantity - 1 : 1,
          }
        : item
    );

  await saveCart(updated);
};

// Clear Cart
export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (error) {
    console.log(error);
  }
};