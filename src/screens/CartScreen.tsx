import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import CartHeader from '../components/CartHeader';
import CartItemCard from '../components/CartItem';
import PromoCodeCard from '../components/PromoCodeCart';
import OrderSummary from '../components/OrderSummary';
import EmptyCart from '../components/EmptyCart';

import { CartItem } from '../types/cart';
import { cartItems as seedData } from '../data/cartData';
import {
  getCart,
  saveCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from '../storage/cartStorage';
import Colors from '../constants/colors';
import type { TabParamList } from '../navigation/AppNavigator';

// ─── Constants ────────────────────────────────────────────────────────────────
const DELIVERY_FEE = 2.99;
const TAX_RATE = 0.08;

// Valid promo codes: code → discount percentage
const PROMO_CODES: Record<string, number> = {
  FOODI10: 10,
  WELCOME20: 20,
  SAVE15: 15,
};

type NavProp = BottomTabNavigationProp<TabParamList>;

// ─── Screen ───────────────────────────────────────────────────────────────────
const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  // ── Load cart from AsyncStorage; seed dummy data on first launch ───────────
  useEffect(() => {
    (async () => {
      const stored = await getCart();
      if (stored.length === 0) {
        // First launch: seed with dummy data and persist
        await saveCart(seedData);
        setCart(seedData);
      } else {
        setCart(stored);
      }
      setLoading(false);
    })();
  }, []);

  // ── Refresh local state from AsyncStorage after each mutation ──────────────
  const refreshCart = useCallback(async () => {
    const updated = await getCart();
    setCart(updated);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleIncrease = useCallback(async (id: string) => {
    await increaseQuantity(id);
    await refreshCart();
  }, [refreshCart]);

  const handleDecrease = useCallback(async (id: string) => {
    // If quantity is already 1, treat decrease as delete
    const item = cart.find((i) => i.id === id);
    if (item && item.quantity === 1) {
      await removeFromCart(id);
    } else {
      await decreaseQuantity(id);
    }
    await refreshCart();
  }, [cart, refreshCart]);

  const handleDelete = useCallback(async (id: string) => {
    await removeFromCart(id);
    await refreshCart();
  }, [refreshCart]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearCart();
            setCart([]);
            setDiscountPercent(0);
          },
        },
      ]
    );
  }, []);

  const handleApplyPromo = useCallback((code: string) => {
    const trimmed = code.trim().toUpperCase();
    const percent = PROMO_CODES[trimmed];
    if (percent) {
      setDiscountPercent(percent);
      Alert.alert('Promo Applied! 🎉', `${percent}% discount has been applied.`);
    } else {
      Alert.alert('Invalid Code', 'This promo code is not valid. Try FOODI10 or SAVE15.');
    }
  }, []);

  const handleCheckout = useCallback(() => {
    setCheckingOut(true);
    setTimeout(async () => {
      setCheckingOut(false);
      const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
      Alert.alert(
        '🎉 Order Placed!',
        `Your order of ${totalItems} item${totalItems > 1 ? 's' : ''} was placed successfully. Total: $${total.toFixed(2)}`,
        [
          {
            text: 'Great!',
            onPress: async () => {
              await clearCart();
              setCart([]);
              setDiscountPercent(0);
            },
          },
        ]
      );
    }, 1500);
  }, [cart]);

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
  const tax = parseFloat(((subtotal - discountAmount) * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal - discountAmount + DELIVERY_FEE + tax).toFixed(2));
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your cart…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <CartHeader totalItems={totalItems} />

      {cart.length === 0 ? (
        /* Empty State */
        <EmptyCart onShopNow={() => navigation.navigate('Home')} />
      ) : (
        <>
          {/* Scrollable cart content */}
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <CartItemCard
                item={item}
                onIncrease={() => handleIncrease(item.id)}
                onDecrease={() => handleDecrease(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            )}
            ListFooterComponent={
              <View style={styles.footerContent}>
                {/* Promo Code */}
                <PromoCodeCard onApply={handleApplyPromo} />

                {/* Order Summary */}
                <OrderSummary
                  subtotal={subtotal}
                  deliveryFee={DELIVERY_FEE}
                  tax={tax}
                  discount={discountAmount}
                />

                {/* Spacer so sticky button doesn't overlap */}
                <View style={{ height: 110 }} />
              </View>
            }
          />

          {/* Sticky Checkout Button */}
          <View style={styles.checkoutWrapper}>
            <TouchableOpacity
              style={[styles.checkoutBtn, checkingOut && styles.checkoutBtnDisabled]}
              onPress={handleCheckout}
              activeOpacity={0.88}
              disabled={checkingOut}
            >
              {checkingOut ? (
                <>
                  <ActivityIndicator size="small" color={Colors.white} />
                  <Text style={styles.checkoutText}>Placing Order…</Text>
                </>
              ) : (
                <>
                  <Text style={styles.checkoutText}>
                    Checkout  •  ${total.toFixed(2)}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>

            {/* Clear all – below checkout */}
            <TouchableOpacity
              style={styles.clearAllBtn}
              onPress={handleClearAll}
              activeOpacity={0.75}
            >
              <Ionicons name="trash-outline" size={14} color={Colors.badge} />
              <Text style={styles.clearAllText}>Clear Cart</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },

  listContent: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  footerContent: {
    marginTop: 4,
  },

  // ── Sticky checkout area ──────────────────────────────────────────────────
  checkoutWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    gap: 10,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  checkoutBtnDisabled: {
    opacity: 0.75,
  },
  checkoutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.badge,
  },
});
