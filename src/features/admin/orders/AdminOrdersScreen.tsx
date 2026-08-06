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
import { useNavigation } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import type { OrderStatus } from '../../../models';

type FilterType = 'All' | 'Pending' | 'Preparing' | 'On the Way' | 'Delivered' | 'Cancelled';

interface MockOrder {
  id: string;
  orderId: string;
  customer: string;
  restaurant: string;
  amount: string;
  status: OrderStatus;
  time: string;
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: '1',
    orderId: '#1042',
    customer: 'Aysha Siddika',
    restaurant: 'Spice Garden',
    amount: '৳480',
    status: 'on_the_way',
    time: '10 min ago',
  },
  {
    id: '2',
    orderId: '#1041',
    customer: 'Rafiq Ahmed',
    restaurant: 'Burger House',
    amount: '৳320',
    status: 'preparing',
    time: '15 min ago',
  },
  {
    id: '3',
    orderId: '#1040',
    customer: 'Fatima Begum',
    restaurant: 'Sultan Dine',
    amount: '৳650',
    status: 'delivered',
    time: '32 min ago',
  },
  {
    id: '4',
    orderId: '#1039',
    customer: 'Mamun Islam',
    restaurant: 'Spice Garden',
    amount: '৳215',
    status: 'pending',
    time: '40 min ago',
  },
  {
    id: '5',
    orderId: '#1038',
    customer: 'Nusrat Jahan',
    restaurant: 'Green Leaf Café',
    amount: '৳180',
    status: 'cancelled',
    time: '1 hr ago',
  },
  {
    id: '6',
    orderId: '#1037',
    customer: 'Karim Hossain',
    restaurant: 'Burger House',
    amount: '৳290',
    status: 'delivered',
    time: '1 hr ago',
  },
  {
    id: '7',
    orderId: '#1036',
    customer: 'Sadia Islam',
    restaurant: 'Sultan Dine',
    amount: '৳520',
    status: 'preparing',
    time: '2 hr ago',
  },
  {
    id: '8',
    orderId: '#1035',
    customer: 'Rahim Uddin',
    restaurant: 'Spice Garden',
    amount: '৳390',
    status: 'pending',
    time: '2 hr ago',
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: Colors.warning, bg: '#FFF8E1' },
  confirmed: { label: 'Confirmed', color: Colors.riderAccent, bg: Colors.infoLight },
  preparing: { label: 'Preparing', color: Colors.riderAccent, bg: Colors.infoLight },
  ready: { label: 'Ready', color: Colors.sellerAccent, bg: Colors.successLight },
  on_the_way: { label: 'On the Way', color: '#9C27B0', bg: '#F3E5F5' },
  delivered: { label: 'Delivered', color: Colors.sellerAccent, bg: Colors.successLight },
  cancelled: { label: 'Cancelled', color: Colors.error, bg: Colors.errorLight },
};

const FILTERS: FilterType[] = ['All', 'Pending', 'Preparing', 'On the Way', 'Delivered', 'Cancelled'];

const filterMatchesStatus = (filter: FilterType, status: OrderStatus): boolean => {
  if (filter === 'All') return true;
  if (filter === 'Pending') return status === 'pending';
  if (filter === 'Preparing') return status === 'preparing' || status === 'confirmed';
  if (filter === 'On the Way') return status === 'on_the_way' || status === 'ready';
  if (filter === 'Delivered') return status === 'delivered';
  if (filter === 'Cancelled') return status === 'cancelled';
  return true;
};

const AdminOrdersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filteredOrders = MOCK_ORDERS.filter((o) => filterMatchesStatus(activeFilter, o.status));

  const renderOrder = ({ item }: { item: MockOrder }) => {
    const statusCfg = STATUS_CONFIG[item.status];
    return (
      <View style={styles.orderCard}>
        {/* Top row */}
        <View style={styles.orderTop}>
          <Text style={styles.orderId}>{item.orderId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        {/* Customer / Restaurant row */}
        <View style={styles.orderMid}>
          <View style={styles.orderMidItem}>
            <Ionicons name="person-outline" size={13} color={Colors.gray} />
            <Text style={styles.orderMidText}>{item.customer}</Text>
          </View>
          <View style={styles.orderMidItem}>
            <Ionicons name="storefront-outline" size={13} color={Colors.gray} />
            <Text style={styles.orderMidText}>{item.restaurant}</Text>
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.orderBottom}>
          <View style={styles.orderBottomItem}>
            <Ionicons name="cash-outline" size={14} color={Colors.sellerAccent} />
            <Text style={styles.orderAmount}>{item.amount}</Text>
          </View>
          <View style={styles.orderBottomItem}>
            <Ionicons name="time-outline" size={13} color={Colors.gray} />
            <Text style={styles.orderTime}>{item.time}</Text>
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
        <View style={{ width: 40 }} />
      </View>

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
