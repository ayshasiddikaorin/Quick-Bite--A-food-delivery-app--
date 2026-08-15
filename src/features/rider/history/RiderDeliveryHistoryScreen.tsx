import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Colors from '../../../constants/colors';
import { useApiData } from '../../../hooks/useApiData';
import { fetchDeliveryHistory } from '../../../services/riderService';
import type { Order } from '../../../models/order';

type Filter = 'all' | 'today' | 'yesterday' | 'week';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
];

const DAY_MS = 86400000;

const DUMMY_HISTORY: Order[] = [
  { id: 'h1', customerId: 'c1', customerName: 'Rina B.', restaurantId: 'r1', restaurantName: 'Spice Garden', items: [], subtotal: 320, deliveryFee: 75, discount: 0, tax: 20, total: 415, status: 'delivered', address: 'Mirpur-2', deliveryType: 'standard', paymentMethod: 'cash', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'h2', customerId: 'c2', customerName: 'Rafi M.', restaurantId: 'r2', restaurantName: 'Pizza Hub', items: [], subtotal: 480, deliveryFee: 90, discount: 0, tax: 29, total: 599, status: 'delivered', address: 'Banani', deliveryType: 'express', paymentMethod: 'cash', createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'h3', customerId: 'c3', customerName: 'Sara K.', restaurantId: 'r3', restaurantName: 'Burger BD', items: [], subtotal: 300, deliveryFee: 60, discount: 0, tax: 18, total: 378, status: 'delivered', address: 'Uttara', deliveryType: 'standard', paymentMethod: 'card', createdAt: new Date(Date.now() - DAY_MS).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'h4', customerId: 'c4', customerName: 'Noor J.', restaurantId: 'r4', restaurantName: 'Sushi Town', items: [], subtotal: 640, deliveryFee: 120, discount: 30, tax: 40, total: 770, status: 'delivered', address: 'Gulshan', deliveryType: 'express', paymentMethod: 'card', createdAt: new Date(Date.now() - 2 * DAY_MS).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'h5', customerId: 'c5', customerName: 'Kamal H.', restaurantId: 'r1', restaurantName: 'Spice Garden', items: [], subtotal: 400, deliveryFee: 80, discount: 0, tax: 24, total: 504, status: 'delivered', address: 'Dhanmondi', deliveryType: 'standard', paymentMethod: 'cash', createdAt: new Date(Date.now() - 5 * DAY_MS).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'h6', customerId: 'c6', customerName: 'Lina S.', restaurantId: 'r6', restaurantName: 'Thai Express', items: [], subtotal: 560, deliveryFee: 110, discount: 0, tax: 34, total: 704, status: 'delivered', address: 'Banani', deliveryType: 'standard', paymentMethod: 'card', createdAt: new Date(Date.now() - 8 * DAY_MS).toISOString(), updatedAt: new Date().toISOString() },
];

interface HistoryItem {
  id: string;
  orderId: string;
  restaurant: string;
  customer: string;
  payout: number;
  deliveryType: string;
  deliveredAt: number;
}

const startOfDay = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const toHistoryItem = (o: Order): HistoryItem => ({
  id: o.id,
  orderId: `#${o.id.slice(-4)}`,
  restaurant: o.restaurantName,
  customer: o.customerName,
  payout: o.deliveryFee || 0,
  deliveryType: o.deliveryType === 'express' ? 'Express' : 'Standard',
  deliveredAt: new Date(o.createdAt).getTime(),
});

const formatWhen = (ts: number): string => {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / DAY_MS);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diffDays <= 1) return `Today, ${time}`;
  if (diffDays === 2) return `Yesterday, ${time}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const HistoryCard: React.FC<{ item: HistoryItem }> = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <View style={styles.orderIdBadge}>
        <Text style={styles.orderIdText}>{item.orderId}</Text>
      </View>
      <View style={styles.payoutBadge}>
        <Text style={styles.payoutText}>৳{item.payout}</Text>
      </View>
    </View>

    <View style={styles.cardMid}>
      <View style={styles.routeRow}>
        <View style={[styles.dot, { backgroundColor: Colors.warning }]} />
        <Text style={styles.restaurantName}>{item.restaurant}</Text>
      </View>
      <View style={styles.routeConnector}>
        <View style={styles.connLine} />
      </View>
      <View style={styles.routeRow}>
        <View style={[styles.dot, { backgroundColor: Colors.riderAccent }]} />
        <Text style={styles.customerName}>{item.customer}</Text>
      </View>
    </View>

    <View style={styles.cardBottom}>
      <View style={styles.metaItem}>
        <Ionicons name="flash-outline" size={12} color={Colors.gray} />
        <Text style={styles.metaText}>{item.deliveryType}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="time-outline" size={12} color={Colors.gray} />
        <Text style={styles.metaText}>{formatWhen(item.deliveredAt)}</Text>
      </View>
      <View style={styles.unratedBadge}>
        <Text style={styles.unratedText}>Delivered</Text>
      </View>
    </View>
  </View>
);

const RiderDeliveryHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const { status, data, reload } = useApiData<Order[]>(fetchDeliveryHistory, DUMMY_HISTORY);
  const loading = status === 'loading';

  // Refresh whenever the screen regains focus
  useFocusEffect(
    React.useCallback(() => { reload(); }, [reload]),
  );

  const now = new Date();
  const todayStart = startOfDay(now);
  const history: HistoryItem[] = (data ?? []).map(toHistoryItem);

  const filtered = history.filter((h) => {
    if (activeFilter === 'today') return h.deliveredAt >= todayStart;
    if (activeFilter === 'yesterday') return h.deliveredAt >= todayStart - DAY_MS && h.deliveredAt < todayStart;
    if (activeFilter === 'week') return h.deliveredAt >= todayStart - 6 * DAY_MS;
    return true;
  });

  const totalPayout = filtered.reduce((sum, h) => sum + h.payout, 0);
  const avgPayout = filtered.length > 0 ? totalPayout / filtered.length : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery History</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshBtn} onPress={reload} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={18} color={Colors.black} />
          </TouchableOpacity>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{loading ? '…' : filtered.length}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.riderAccent} />
          <Text style={styles.emptyTitle}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Filter chips */}
              <FlatList
                data={FILTERS}
                keyExtractor={(f) => f.key}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: f }) => (
                  <TouchableOpacity
                    style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
                    onPress={() => setActiveFilter(f.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              {/* Summary strip */}
              <View style={styles.summaryStrip}>
                <View style={styles.stripItem}>
                  <Text style={styles.stripValue}>{filtered.length}</Text>
                  <Text style={styles.stripLabel}>Deliveries</Text>
                </View>
                <View style={styles.stripDivider} />
                <View style={styles.stripItem}>
                  <Text style={styles.stripValue}>৳{totalPayout.toFixed(2)}</Text>
                  <Text style={styles.stripLabel}>Earned</Text>
                </View>
                <View style={styles.stripDivider} />
                <View style={styles.stripItem}>
                  <Text style={styles.stripValue}>৳{avgPayout.toFixed(2)}</Text>
                  <Text style={styles.stripLabel}>Avg Fee</Text>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>No deliveries found</Text>
            </View>
          }
          renderItem={({ item }) => <HistoryCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
};

export default RiderDeliveryHistoryScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 60,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  countBadge: {
    minWidth: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.riderAccent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  countText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  list: { padding: 20, paddingBottom: 30 },
  filterRow: { gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.riderAccent, borderColor: Colors.riderAccent },
  filterChipText: { fontSize: 12, fontWeight: '600', color: Colors.gray },
  filterChipTextActive: { color: Colors.white, fontWeight: '700' },
  summaryStrip: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 16,
    padding: 16, marginBottom: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  stripItem: { flex: 1, alignItems: 'center' },
  stripValue: { fontSize: 18, fontWeight: '900', color: Colors.riderAccent },
  stripLabel: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  stripDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  card: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 14, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: Colors.success,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderIdBadge: { backgroundColor: Colors.lightGray, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  orderIdText: { fontSize: 13, fontWeight: '800', color: Colors.black },
  payoutBadge: { backgroundColor: Colors.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  payoutText: { fontSize: 13, fontWeight: '800', color: Colors.success },
  cardMid: { marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  restaurantName: { fontSize: 13, fontWeight: '700', color: Colors.black },
  customerName: { fontSize: 13, fontWeight: '600', color: Colors.darkGray },
  routeConnector: { paddingLeft: 3, paddingVertical: 3 },
  connLine: { width: 1, height: 10, backgroundColor: Colors.border, marginLeft: 3 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.gray },
  unratedBadge: { backgroundColor: Colors.lightGray, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  unratedText: { fontSize: 10, color: Colors.gray, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray },
});