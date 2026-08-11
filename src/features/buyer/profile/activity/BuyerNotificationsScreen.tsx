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

interface OrderNotification {
  id: string;
  orderId: string;
  restaurantName: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  message: string;
  time: number; // timestamp
}

const NOTIF_META: Record<OrderStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; message: string }> = {
  pending:        { icon: 'time-outline',        color: Colors.warning,     bg: '#FFF8E1', message: 'Order received — awaiting restaurant confirmation' },
  confirmed:      { icon: 'checkmark-circle-outline', color: Colors.success,  bg: Colors.successLight, message: 'Order confirmed! The restaurant is preparing your food' },
  preparing:      { icon: 'restaurant-outline',  color: Colors.info,       bg: Colors.infoLight, message: 'Your order is being prepared by the kitchen' },
  ready:          { icon: 'bag-check-outline',   color: Colors.riderAccent, bg: Colors.infoLight, message: 'Your order is packed and ready for pickup' },
  assigned:       { icon: 'bicycle-outline',     color: Colors.warning,     bg: '#FFF8E1', message: 'A rider has been assigned to your order' },
  on_the_way:     { icon: 'bicycle-outline',     color: Colors.primary,     bg: Colors.secondary, message: 'Your rider is on the way with your order' },
  reached:        { icon: 'location-outline',    color: Colors.riderAccent, bg: Colors.infoLight, message: 'Your rider has arrived at your location' },
  delivered:      { icon: 'home-outline',        color: Colors.success,     bg: Colors.successLight, message: 'Your order has been delivered — enjoy your meal!' },
  cancelled:      { icon: 'close-circle-outline', color: Colors.error,      bg: Colors.errorLight, message: 'Your order was cancelled' },
};

function makeDummy(timestampPad: number, status: OrderStatus): Order {
  return {
    id: `dummy_notif_${status}`,
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
    address: 'Mirpur-2',
    deliveryType: 'standard',
    paymentMethod: 'Cash on Delivery',
    createdAt: new Date(Date.now() - timestampPad).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const DUMMY_ORDERS: Order[] = [
  makeDummy(4 * 3600000, 'on_the_way'),
  makeDummy(26 * 3600000, 'delivered'),
  makeDummy(3 * 86400000, 'delivered'),
];

function timeAgo(ts: number): string {
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hr ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} day${diffD > 1 ? 's' : ''} ago`;
}

const BuyerNotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { status, data, reload } = useApiData<Order[]>(fetchMyOrders, DUMMY_ORDERS);
  const loading = status === 'loading';

  const notifications: OrderNotification[] = (data ?? [])
    .map((o) => {
      const meta = NOTIF_META[o.status];
      return {
        id: o.id,
        orderId: `#${o.id.slice(-6).toUpperCase()}`,
        restaurantName: o.restaurantName,
        icon: meta.icon,
        color: meta.color,
        bg: meta.bg,
        message: meta.message,
        time: new Date(o.createdAt).getTime(),
      };
    })
    .sort((a, b) => b.time - a.time);

  const goToOrder = (n: OrderNotification) => {
    const order = (data ?? []).find((o) => o.id === n.id);
    if (!order) return;
    navigation.navigate('OrderTracking', {
      orderId: order.id,
      paymentMethod: order.paymentMethod,
      total: order.total,
      address: order.address,
      deliveryType: order.deliveryType,
      isDummy: false,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
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
          <Text style={styles.fallbackText}>Offline preview · tap refresh for live updates</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyText}>Order updates will appear here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => goToOrder(item)} activeOpacity={0.8}>
              <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.info}>
                <View style={styles.infoTop}>
                  <Text style={styles.restaurant} numberOfLines={1}>{item.restaurantName}</Text>
                  <Text style={styles.time}>{timeAgo(item.time)}</Text>
                </View>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.orderId}>{item.orderId}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default BuyerNotificationsScreen;

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
  card: {
    flexDirection: 'row',
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  infoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  restaurant: { fontSize: 14, fontWeight: '800', color: Colors.black, flex: 1 },
  time: { fontSize: 11, color: Colors.gray },
  message: { fontSize: 13, color: Colors.darkGray, lineHeight: 18 },
  orderId: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray },
  emptyText: { fontSize: 13, color: Colors.gray, textAlign: 'center' },
});