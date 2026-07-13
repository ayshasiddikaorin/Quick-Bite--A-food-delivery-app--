import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface CartItem {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  image: string;
  quantity: number;
}

const INITIAL_CART: CartItem[] = [
  {
    id: 'c1',
    name: 'Classic Smash Burger',
    restaurant: 'Burger Republic',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',
    quantity: 2,
  },
  {
    id: 'c2',
    name: 'Margherita Pizza',
    restaurant: 'Pizza Palace',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80',
    quantity: 1,
  },
];

const CartScreen: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 2.99;
  const total = subtotal + delivery;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.accent} />
          <Text style={styles.title}>My Cart</Text>
        </View>
        {cart.length > 0 && (
          <TouchableOpacity onPress={() => setCart([])} activeOpacity={0.75}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.length === 0 ? (
        /* Empty State */
        <View style={styles.empty}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="cart-outline" size={52} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from the menu to get started</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemRestaurant}>{item.restaurant}</Text>
                  <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.id, -1)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="remove" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, styles.qtyBtnAdd]}
                    onPress={() => updateQty(item.id, 1)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Order Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${delivery.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accent: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.badge,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },
  itemRestaurant: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnAdd: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.black,
    minWidth: 18,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
    gap: 14,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  summary: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 18,
    marginTop: 6,
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
});

export default CartScreen;
