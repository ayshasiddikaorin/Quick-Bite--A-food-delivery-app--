import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../../constants/colors';
import { useApiData } from '../../../../hooks/useApiData';
import { fetchMyOrders } from '../../../../services/orderService';
import type { Order, OrderStatus } from '../../../../models';
import type { BuyerStackParamList } from '../../../../navigation/BuyerNavigator';

type NavProp = NativeStackNavigationProp<BuyerStackParamList>;

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'on_the_way', 'reached'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  assigned: 'Rider Assigned',
  on_the_way: 'On the Way',
  reached: 'Rider Arrived',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: Colors.warning,
  confirmed: Colors.success,
  preparing: Colors.info,
  ready: Colors.riderAccent,
  assigned: Colors.warning,
  on_the_way: Colors.primary,
  reached: Colors.riderAccent,
  delivered: Colors.success,
  cancelled: Colors.error,
};

function makeDummy(timestampPad: number, status: OrderStatus): Order {
  return {
    id: `dummy_${status}_${timestampPad}`,
    customerId: 'dummy',
    customerName: 'You',
    restaurantId: 'r1',
    restaurantName: 'Spice Garden',
    items: [{ menuItemId: 'm1', name: 'Chicken Biryani', image: '', price: 320, quantity: 2 }],
    subtotal: 640,
    deliveryFee: 60,
    discount: 0,
    tax: 40,
    total: 740,
    status,
    address: 'House 5, Road 7, Mirpur-2, Dhaka',
    deliveryType: 'standard',
    paymentMethod: 'Cash on Delivery',
    createdAt: new Date(Date.now() - timestampPad).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const DUMMY_ORDERS: Order[] = [
  makeDummy(4 * 3600000, 'preparing'),
  makeDummy(26 * 3600000, 'delivered'),
  makeDummy(3 * 86400000, 'delivered'),
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

const BuyerMyOrdersScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { status, data, reload } = useApiData<Order[]>(fetchMyOrders, DUMMY_ORDERS);
  const loading = status === 'loading';

  const orders = (data ?? []).slice();
  const sortScore = (s: OrderStatus) => ACTIVE_STATUSES.includes(s) ? 0 : 1;
  orders.sort((a, b) => {
    const aScore = sortScore(a.status);
    const bScore = sortScore(b.status);
    if (aScore !== bScore) return aScore - bScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeCount = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;

  const goTrack = (order: Order) => {
    navigation.navigate('OrderTracking', {
      orderId: order.id,
      paymentMethod: order.paymentMethod,
      total: order.total,
      address: order.address,
      deliveryType: order.deliveryType,
      isDummy: false,
    });
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const isActive = ACTIVE_STATUSES.includes(item.status);
    const count = item.items.reduce((s, i) => s + i.quantity, 0);
    return (
      <TouchableOpacity style={styles.card} onPress={() => goTrack(item)} activeOpacity={0.8}>
        <View style={[styles.cardIcon, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
          <Ionicons name="receipt-outline" size={20} color={STATUS_COLOR[item.status]} />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.restaurant} numberOfLines={1}>{item.restaurantName}</Text>
          <Text style={styles.meta}>
            #{item.id.slice(-6).toUpperCase()} · {count} item{count > 1 ? 's' : ''} · {formatDate(item.createdAt)}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
              {STATUS_LABEL[item.status]}
            </Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.total}>৳{item.total.toFixed(0)}</Text>
          {isActive && (
            <Ionicons name="navigate-outline" size={16} color={Colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.backBtn} onPress={reload} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="refresh-outline" size={20} color={Colors.black} />
          )}
        </TouchableOpacity>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="wifi-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Offline preview · tap refresh for live orders</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>Loading your orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.summaryStrip}>
              <View style={styles.stripItem}>
                <Text style={styles.stripValue}>{activeCount}</Text>
                <Text style={styles.stripLabel}>Active</Text>
              </View>
              <View style={styles.stripDivider} />
              <View style={styles.stripItem}>
                <Text style={styles.stripValue}>{orders.filter((o) => o.status === 'delivered').length}</Text>
                <Text style={styles.stripLabel}>Delivered</Text>
              </View>
              <View style={styles.stripDivider} />
              <View style={styles.stripItem}>
                <Text style={styles.stripValue}>{orders.length}</Text>
                <Text style={styles.stripLabel}>Total</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyText}>Orders you place will appear here.</Text>
            </View>
          }
          renderItem={renderOrder}
        />
      )}
    </SafeAreaView>
  );
};

export default BuyerMyOrdersScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', paddingHorizontal: 16, paddingVertical: 8,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '600', flex: 1 },
  list: { padding: 20, paddingBottom: 30 },
  summaryStrip: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 16,
    padding: 16, marginBottom: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  stripItem: { flex: 1, alignItems: 'center' },
  stripValue: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  stripLabel: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  stripDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  restaurant: { fontSize: 14, fontWeight: '800', color: Colors.black },
  meta: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 2 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  total: { fontSize: 16, fontWeight: '900', color: Colors.black },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray },
  emptyText: { fontSize: 13, color: Colors.gray, textAlign: 'center' },
});