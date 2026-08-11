import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import { useApiData } from '../../../hooks/useApiData';
import { fetchSellerStats } from '../../../services/orderService';
import type { SellerStats } from '../../../models';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY_STATS: SellerStats = {
  newOrders: 0,
  preparing: 0,
  completed: 0,
  totalSales: 0,
  weeklyData: [0, 0, 0, 0, 0, 0, 0],
};

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SellerSalesScreen: React.FC = () => {
  const navigation = useNavigation();

  const statsState = useApiData<SellerStats>(fetchSellerStats, EMPTY_STATS);
  const status = statsState.status;
  const stats = statsState.status !== 'loading' ? statsState.data : EMPTY_STATS;
  const reload = statsState.reload;

  const weeklyData = stats.weeklyData.length === 7 ? stats.weeklyData : EMPTY_STATS.weeklyData;
  const weeklyTotal = stats.totalSales;
  const maxVal = Math.max(...weeklyData, 1);
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const bestIdx = weeklyData.indexOf(Math.max(...weeklyData));

  if (status === 'loading') {
    return <LoadingScreen label="Loading sales report…" color={Colors.sellerAccent} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales Report</Text>
        <TouchableOpacity style={styles.backBtn} onPress={reload} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Backend offline — live sales unavailable</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Weekly Total Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalCardTop}>
            <View>
              <Text style={styles.totalLabel}>Weekly Total Sales</Text>
              <Text style={styles.totalAmount}>৳{weeklyTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={16} color={Colors.sellerAccent} />
              <Text style={styles.growthText}>{weeklyData.reduce((s, v) => s + v, 0)} orders</Text>
            </View>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalMeta}>
            <View style={styles.totalMetaItem}>
              <Ionicons name="receipt-outline" size={16} color={Colors.gray} />
              <Text style={styles.totalMetaText}>{stats.completed} completed</Text>
            </View>
            <View style={styles.totalMetaItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
              <Text style={styles.totalMetaText}>This week</Text>
            </View>
          </View>
        </View>

        {/* Bar Chart */}
        <Text style={styles.sectionTitle}>Daily Breakdown (Orders)</Text>
        <View style={styles.chartCard}>
          <View style={styles.barsRow}>
            {weeklyData.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barValueLabel, i === todayIdx && { color: Colors.sellerAccent }]}>
                  {val}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (val / maxVal) * 100,
                      backgroundColor: i === todayIdx ? Colors.sellerAccent : '#C8E6C9',
                    },
                  ]}
                />
                <Text style={[styles.barLabel, i === todayIdx && { color: Colors.sellerAccent, fontWeight: '700' }]}>
                  {DAYS[i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Sales List */}
        <Text style={styles.sectionTitle}>Sales by Day</Text>
        <View style={styles.listCard}>
          {WEEKDAY_NAMES.map((dayName, index) => (
            <View key={dayName} style={[styles.listRow, index < WEEKDAY_NAMES.length - 1 && styles.listRowBorder]}>
              <View style={styles.listLeft}>
                <View
                  style={[
                    styles.dayDot,
                    { backgroundColor: index === bestIdx ? Colors.sellerAccent : Colors.successLight },
                  ]}
                />
                <Text style={[
                  styles.dayName,
                  index === bestIdx && { color: Colors.sellerAccent, fontWeight: '800' },
                ]}>
                  {dayName}
                </Text>
              </View>
              <View style={styles.listRight}>
                <Text style={[
                  styles.dayAmount,
                  index === bestIdx && { color: Colors.sellerAccent },
                ]}>
                  {weeklyData[index]} orders
                </Text>
                {index === bestIdx && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>Best</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerSalesScreen;

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
  scroll: { padding: 20, paddingBottom: 40 },

  // Total card
  totalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.sellerAccent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  totalCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalLabel: { fontSize: 13, color: Colors.gray, fontWeight: '600', marginBottom: 4 },
  totalAmount: { fontSize: 32, fontWeight: '900', color: Colors.black },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  growthText: { fontSize: 13, fontWeight: '700', color: Colors.sellerAccent },
  totalDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 14 },
  totalMeta: { flexDirection: 'row', gap: 20 },
  totalMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  totalMetaText: { fontSize: 13, color: Colors.gray, fontWeight: '500' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 12,
  },

  // Chart
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 140 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barValueLabel: { fontSize: 10, fontWeight: '600', color: Colors.gray, marginBottom: 2 },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: Colors.gray, fontWeight: '600', marginTop: 4 },

  // List
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayDot: { width: 10, height: 10, borderRadius: 5 },
  dayName: { fontSize: 14, fontWeight: '600', color: Colors.black },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayAmount: { fontSize: 15, fontWeight: '700', color: Colors.black },
  bestBadge: {
    backgroundColor: Colors.sellerAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
});
