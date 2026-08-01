import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../constants/colors';

interface HistoryItem {
  id: string;
  orderId: string;
  restaurant: string;
  customer: string;
  payout: string;
  distance: string;
  deliveredAt: string;
  rating: number | null;
}

const HISTORY: HistoryItem[] = [
  { id: 'h1', orderId: '#1045', restaurant: 'Spice Garden', customer: 'Rina B.', payout: '৳75', distance: '2.1 km', deliveredAt: 'Today, 2:30 PM', rating: 5 },
  { id: 'h2', orderId: '#1044', restaurant: 'Pizza Hub', customer: 'Rafi M.', payout: '৳90', distance: '3.3 km', deliveredAt: 'Today, 12:10 PM', rating: 4 },
  { id: 'h3', orderId: '#1043', restaurant: 'Burger BD', customer: 'Sara K.', payout: '৳60', distance: '1.8 km', deliveredAt: 'Yesterday, 7:45 PM', rating: 5 },
  { id: 'h4', orderId: '#1040', restaurant: 'Sushi Town', customer: 'Noor J.', payout: '৳120', distance: '4.2 km', deliveredAt: 'Yesterday, 1:20 PM', rating: null },
  { id: 'h5', orderId: '#1038', restaurant: 'Spice Garden', customer: 'Kamal H.', payout: '৳80', distance: '2.6 km', deliveredAt: 'Mon, Jan 13', rating: 3 },
  { id: 'h6', orderId: '#1035', restaurant: 'Thai Express', customer: 'Lina S.', payout: '৳110', distance: '3.9 km', deliveredAt: 'Mon, Jan 13', rating: 5 },
  { id: 'h7', orderId: '#1030', restaurant: 'Deshi Bhojon', customer: 'Tariq A.', payout: '৳65', distance: '1.5 km', deliveredAt: 'Sun, Jan 12', rating: 4 },
];

type Filter = 'all' | 'today' | 'yesterday' | 'week';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Ionicons
        key={s}
        name={s <= rating ? 'star' : 'star-outline'}
        size={12}
        color={Colors.warning}
      />
    ))}
  </View>
);

const RiderDeliveryHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const filtered = HISTORY.filter((h) => {
    if (activeFilter === 'today') return h.deliveredAt.startsWith('Today');
    if (activeFilter === 'yesterday') return h.deliveredAt.startsWith('Yesterday');
    if (activeFilter === 'week') return !h.deliveredAt.startsWith('Sun');
    return true;
  });

  const totalPayout = filtered.reduce((sum, h) => sum + parseInt(h.payout.replace('৳', '')), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery History</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length}</Text>
        </View>
      </View>

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
                <Text style={styles.stripValue}>৳{totalPayout}</Text>
                <Text style={styles.stripLabel}>Earned</Text>
              </View>
              <View style={styles.stripDivider} />
              <View style={styles.stripItem}>
                <Text style={styles.stripValue}>
                  {filtered.filter((h) => h.rating === 5).length}
                </Text>
                <Text style={styles.stripLabel}>5⭐ Ratings</Text>
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
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.orderIdBadge}>
                <Text style={styles.orderIdText}>{item.orderId}</Text>
              </View>
              <View style={styles.payoutBadge}>
                <Text style={styles.payoutText}>{item.payout}</Text>
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
                <Ionicons name="navigate-outline" size={12} color={Colors.gray} />
                <Text style={styles.metaText}>{item.distance}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color={Colors.gray} />
                <Text style={styles.metaText}>{item.deliveredAt}</Text>
              </View>
              {item.rating !== null ? (
                <StarRating rating={item.rating} />
              ) : (
                <View style={styles.unratedBadge}>
                  <Text style={styles.unratedText}>No rating</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
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
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray },
});
