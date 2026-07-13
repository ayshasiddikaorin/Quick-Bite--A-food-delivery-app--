/**
 * cartStorage.ts
 *
 * Thin AsyncStorage-based persistence layer for the cart.
 * All storage logic is isolated here so the service can be swapped
 * for a Firebase / REST backend without touching any UI component.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../data/cartData';

const CART_KEY = '@foodigo_cart';

// ─── Save ───────────────────────────────────────────────────────────────────
/**
 * Persist the full cart array to local storage.
 * Call this after every mutation (add, remove, qty change).
 */
export async function saveCart(items: CartItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('[cartStorage] saveCart failed:', error);
  }
}

// ─── Load ───────────────────────────────────────────────────────────────────
/**
 * Load the cart from local storage.
 * Returns null when no cart has been saved yet (first launch).
 */
export async function loadCart(): Promise<CartItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    if (raw === null) return null;
    return JSON.parse(raw) as CartItem[];
  } catch (error) {
    console.warn('[cartStorage] loadCart failed:', error);
    return null;
  }
}

// ─── Clear ──────────────────────────────────────────────────────────────────
/**
 * Remove the cart from local storage entirely.
 * Useful after a successful checkout.
 */
export async function clearCart(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (error) {
    console.warn('[cartStorage] clearCart failed:', error);
  }
}
