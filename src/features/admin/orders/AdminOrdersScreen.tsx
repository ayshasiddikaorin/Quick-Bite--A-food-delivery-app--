import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import { useApiData } from '../../../hooks/useApiData';
import { adminFetchAllOrders } from '../../../services/orderService';
import type { Order, OrderStatus } from '../../../models';
import { formatBDT } from '../../../utils/currency';

type FilterType = 'All' | 'Pending' | 'Preparing' | 'On the Way' | 'Delivered' | 'Cancelled';

function toOrder(partial: Partial<Order> & { id: string }): Order {
  const now = new Date().toISOString();
  return {
    customerId: partial.customerId ?? '',
    customerName: partial.customerName ?? 'Unknown customer',
    restaurantId: partial.restaurantId ?? '',
    restaurantName: partial.restaurantName ?? 'Restaurant',
    items: partial.items ?? [],
    subtotal: partial.subtotal ?? 0,
    deliveryFee: partial.deliveryFee ?? 0,
    discount: partial.discount ?? 0,
    tax: partial.tax ?? 0,
    total: partial.total ?? 0,
    status: partial.status ?? 'pending',
    address: partial.address ?? '',
    deliveryType: partial.deliveryType ?? 'standard',
    paymentMethod: partial.paymentMethod ?? '',
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    riderName: partial.riderName,
    ...partial,
  };
}

const DUMMY_ORDERS: Order[] = [
  toOrder({ id: 'd1', customerName: 'Aysha Siddika', restaurantName: 'Burger Republic', total: 480, status: 'on_the_way', createdAt: new Date(Date.now() - 600000).toISOString() }),
  toOrder({ id: 'd2', customerName: 'Rafiq Ahmed', restaurantName: 'Pizza Palace', total: 320, status: 'preparing', createdAt: new Date(Date.now() - 900000).toISOString() }),
  toOrder({ id: 'd3', customerName: 'Fatima Begum', restaurantName: 'Tokyo Garden', total: 650, status: 'delivered', createdAt: new Date(Date.now() - 1920000).toISOString() }),
  toOrder({ id: 'd4', customerName: 'Mamun Islam', restaurantName: 'Burger Republic', total: 215, status: 'pending', createdAt: new Date(Date.now() - 2400000).toISOString() }),
  toOrder({ id: 'd5', customerName: 'Nusrat Jahan', restaurantName: 'Taco Loco', total: 180, status: 'cancelled', createdAt: new Date(Date.now() - 3600000).toISOString() }),
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: Colors.warning, bg: '#FFF8E1' },
  confirmed: { label: 'Confirmed', color: Colors.riderAccent, bg: Colors.infoLight },
  preparing: { label: 'Preparing', color: Colors.riderAccent, bg: Colors.infoLight },
  ready: { label: 'Ready', color: Colors.sellerAccent, bg: Colors.successLight },
  assigned: { label: 'Assigned', color: Colors.warning, bg: '#FFF8E1' },
  on_the_way: { label: 'On the Way', color: '#9C27B0', bg: '#F3E5F5' },
  reached: { label: 'Reached', color: Colors.primary, bg: Colors.infoLight },
  delivered: { label: 'Delivered', color: Colors.sellerAccent, bg: Colors.successLight },
  cancelled: { label: 'Cancelled', color: Colors.error, bg: Colors.errorLight },
};

const FILTERS: FilterType[] = ['All', 'Pending', 'Preparing', 'On the Way', 'Delivered', 'Cancelled'];

const filterMatchesStatus = (filter: FilterType, status: OrderStatus): boolean => {
  if (filter === 'All') return true;
  if (filter === 'Pending') return status === 'pending';
  if (filter === 'Preparing') return status === 'preparing' || status === 'confirmed';
  if (filter === 'On the Way') return status === 'assigned' || status === 'on_the_way' || status === 'ready' || status === 'reached';
  if (filter === 'Delivered') return status === 'delivered';
  if (filter === 'Cancelled') return status === 'cancelled';
  return true;
};

const formatTime = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (isNaN(diff) || diff < 0) return 'just now';
  return diff < 60 ? `${diff} min ago` : `${Math.floor(diff / 60)} hr ago`;
};

const AdminOrdersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const statsState = useApiData<Order[]>(() => adminFetchAllOrders(), DUMMY_ORDERS);
  const orders = statsState.status !== 'loading' ? statsState.data : DUMMY_ORDERS;
  const status = statsState.status;
  const reload = statsState.reload;

  // Refresh whenever the screen regains focus
  useFocusEffect(
    React.useCallback(() => { reload(); }, [reload]),
  );

  const filteredOrders = orders.filter((o) => filterMatchesStatus(activeFilter, o.status));

  if (status === 'loading') {
    return <LoadingScreen label="Loading all orders…" color={Colors.adminAccent} />;
  }

  const renderOrder = ({ item }: { item: Order }) => {
    const statusCfg = STATUS_CONFIG[item.status];
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTop}>
          <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <View style={styles.orderMid}>
          <View style={styles.orderMidItem}>
            <Ionicons name="person-outline" size={13} color={Colors.gray} />
            <Text style={styles.orderMidText}>{item.customerName}</Text>
          </View>
          <View style={styles.orderMidItem}>
            <Ionicons name="storefront-outline" size={13} color={Colors.gray} />
            <Text style={styles.orderMidText}>{item.restaurantName}</Text>
          </View>
        </View>

        <View style={styles.orderBottom}>
          <View style={styles.orderBottomItem}>
            <Ionicons name="cash-outline" size={14} color={Colors.sellerAccent} />
            <Text style={styles.orderAmount}>{formatBDT(item.total)}</Text>
          </View>
          <View style={styles.orderBottomItem}>
            <Ionicons name="time-outline" size={13} color={Colors.gray} />
            <Text style={styles.orderTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Orders</Text>
        <TouchableOpacity style={styles.backBtn} onPress={reload} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Dummy data mode · backend offline — showing sample orders</Text>
        </View>
      )}

      {/* Filter Chips (horizontal scroll) */}
      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredOrders.length} orders</Text>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AdminOrdersScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.black },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '700', flex: 1 },

  // Filters
  filterWrapper: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  filterChipActive: { backgroundColor: Colors.adminAccent },
  filterChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  filterChipTextActive: { color: Colors.white },

  // Count
  countRow: { paddingHorizontal: 16, paddingVertical: 10 },
  countText: { fontSize: 13, color: Colors.gray, fontWeight: '500' },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  // Order card
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: { fontSize: 15, fontWeight: '900', color: Colors.black },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderMid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderMidItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orderMidText: { fontSize: 12, color: Colors.darkGray, fontWeight: '500' },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderBottomItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orderAmount: { fontSize: 14, fontWeight: '800', color: Colors.black },
  orderTime: { fontSize: 12, color: Colors.gray, fontWeight: '500' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.gray, fontWeight: '600' },
});