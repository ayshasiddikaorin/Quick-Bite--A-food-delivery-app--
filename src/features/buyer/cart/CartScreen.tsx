import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';

import CartHeader from './CartHeader';
import CartItemCard from './CartItem';
import PromoCodeCard from '../../../components/PromoCodeCart';
import OrderSummary from '../../../components/OrderSummary';
import EmptyCart from './EmptyCart';

import type { CartItem } from '../../../models';
import {
  getCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from '../../../storage/cartStorage';
import Colors from '../../../constants/colors';

// ─── Constants ────────────────────────────────────────────────────────────────
const TAX_RATE = 0.08;

// Valid promo codes: code → discount percentage
const PROMO_CODES: Record<string, number> = {
  FOODI10: 10,
  WELCOME20: 20,
  SAVE15: 15,
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { showPopup } = useNotifications();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Load cart from AsyncStorage ───────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const stored = await getCart();
        setCart(stored);
        setLoading(false);
      })();
    }, []),
  );

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
    showPopup({
      title: 'Clear Cart',
      message: 'Are you sure you want to remove all items from your cart?',
      variant: 'warning',
      confirmText: 'Yes, Clear All',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        await clearCart();
        setCart([]);
        setDiscountPercent(0);
      },
    });
  }, [showPopup]);

  const handleApplyPromo = useCallback((code: string) => {
    const trimmed = code.trim().toUpperCase();
    const percent = PROMO_CODES[trimmed];
    if (percent) {
      setDiscountPercent(percent);
      showPopup({
        title: 'Promo Applied! 🎉',
        message: `${percent}% discount has been applied to your order.`,
        variant: 'success',
        confirmText: 'Awesome',
      });
    } else {
      showPopup({
        title: 'Invalid Promo Code',
        message: 'This promo code is not valid. Try using FOODI10 or SAVE15.',
        variant: 'error',
        confirmText: 'Try Again',
      });
    }
  }, [showPopup]);

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
  const tax = parseFloat(((subtotal - discountAmount) * TAX_RATE).toFixed(2));
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = useCallback(() => {
    if (!user) {
      showPopup({
        title: 'Sign in required',
        message: 'Please sign in as a buyer to place your order.',
        variant: 'warning',
        confirmText: 'Sign In',
        cancelText: 'Not Now',
        showCancel: true,
        onConfirm: () => navigation.navigate('Login', { role: 'buyer' }),
      });
      return;
    }
    navigation.navigate('Checkout', { subtotal, discount: discountAmount, tax });
  }, [user, showPopup, subtotal, discountAmount, tax]);

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
                  deliveryFee={0}
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
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.88}
            >
              <Text style={styles.checkoutText}>
                Proceed to Checkout
              </Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
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
