import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import { useApiData } from '../../../hooks/useApiData';
import { useNotifications } from '../../../context/NotificationContext';
import { fetchEarnings, fetchRiderProfile, RiderEarnings } from '../../../services/riderService';
import type { Rider } from '../../../models/rider';

const { width: W } = Dimensions.get('window');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DUMMY_EARNINGS: RiderEarnings = {
  todayEarnings: 480,
  weeklyEarnings: [320, 480, 290, 550, 410, 620, 480],
  totalEarnings: 11200,
  totalDeliveries: 47,
};

const DUMMY_RIDER: Rider = {
  id: 'rider_dummy',
  userId: 'rider_dummy',
  name: 'Karim Hossain',
  email: 'karim@rider.com',
  phone: '01XXXXXXXXX',
  vehicleType: 'Motorcycle',
  isOnline: false,
  isVerified: true,
  rating: 4.8,
  totalDeliveries: 47,
  totalEarnings: 11200,
  todayEarnings: 480,
  weeklyEarnings: [320, 480, 290, 550, 410, 620, 480],
};

const RiderEarningsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showPopup } = useNotifications();

  const { status, data, reload } = useApiData<RiderEarnings>(fetchEarnings, DUMMY_EARNINGS);
  const profileState = useApiData<Rider>(fetchRiderProfile, DUMMY_RIDER);
  const { reload: reloadProfile } = profileState;
  const loading = status === 'loading';

  // Refresh whenever the screen regains focus
  useFocusEffect(
    React.useCallback(() => { reload(); reloadProfile(); }, [reload, reloadProfile]),
  );

  const weekly = data.weeklyEarnings ?? DUMMY_EARNINGS.weeklyEarnings;
  const weeklyTotal = weekly.reduce((a, b) => a + b, 0);
  const barData = weekly.length === 7 ? weekly : [...weekly, ...DUMMY_EARNINGS.weeklyEarnings].slice(0, 7);
  const MAX_VAL = Math.max(...barData, 1);

  const avgPerDelivery =
    data.totalDeliveries > 0 ? Math.round(data.totalEarnings / data.totalDeliveries) : 0;
  const rating = profileState.status !== 'loading' ? profileState.data.rating : DUMMY_RIDER.rating;

  if (status === 'loading') {
    return <LoadingScreen label="Loading your earnings…" color={Colors.riderAccent} />;
  }

  const handleRequestPayout = () => {
    showPopup({
      title: 'Payout Requested 💸',
      message: `Your payout of ৳${data.totalEarnings.toLocaleString()} has been submitted and will be processed within 24 hours.`,
      variant: 'success',
      autoDismissMs: 4500,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Earnings</Text>
        <View style={styles.headerRight}>
          {loading && <ActivityIndicator size="small" color={Colors.riderAccent} />}
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => { reload(); reloadProfile(); }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryMainItem}>
              <Text style={styles.summaryMainLabel}>This Week</Text>
              <Text style={styles.summaryMainValue}>৳{weeklyTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryDividerV} />
            <View style={styles.summaryMainItem}>
              <Text style={styles.summaryMainLabel}>All Time</Text>
              <Text style={styles.summaryMainValue}>৳{data.totalEarnings.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.summaryDividerH} />

          <View style={styles.summaryBottomRow}>
            <View style={styles.summaryMiniItem}>
              <Ionicons name="bicycle-outline" size={20} color={Colors.riderAccent} />
              <View>
                <Text style={styles.summaryMiniValue}>{data.totalDeliveries}</Text>
                <Text style={styles.summaryMiniLabel}>Total Deliveries</Text>
              </View>
            </View>
            <View style={styles.summaryMiniItem}>
              <Ionicons name="star-outline" size={20} color={Colors.warning} />
              <View>
                <Text style={styles.summaryMiniValue}>{rating ? rating.toFixed(1) : '—'}</Text>
                <Text style={styles.summaryMiniLabel}>Avg Rating</Text>
              </View>
            </View>
            <View style={styles.summaryMiniItem}>
              <Ionicons name="cash-outline" size={20} color={Colors.success} />
              <View>
                <Text style={styles.summaryMiniValue}>৳{avgPerDelivery}</Text>
                <Text style={styles.summaryMiniLabel}>Avg/Delivery</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <Text style={styles.sectionTitle}>Weekly Earnings Chart</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartPeriod}>This Week</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={13} color={Colors.riderAccent} />
              <Text style={styles.growthText}>৳{weeklyTotal.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.barsRow}>
            {barData.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barValueLabel, i === 5 && { color: Colors.riderAccent }]}>
                  {val}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (val / MAX_VAL) * 100,
                      backgroundColor: i === 5 ? Colors.riderAccent : Colors.infoLight,
                    },
                  ]}
                />
                <Text style={[styles.barLabel, i === 5 && { color: Colors.riderAccent, fontWeight: '700' }]}>
                  {DAYS[i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Breakdown */}
        <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        <View style={styles.listCard}>
          {barData.map((amount, index) => {
            const isBest = index === barData.indexOf(Math.max(...barData));
            const day = DAY_NAMES[index];
            return (
              <View
                key={day}
                style={[styles.listRow, index < barData.length - 1 && styles.listRowBorder]}
              >
                <View style={styles.listLeft}>
                  <View
                    style={[
                      styles.dayDot,
                      { backgroundColor: isBest ? Colors.riderAccent : Colors.infoLight },
                    ]}
                  />
                  <View>
                    <Text style={[styles.dayName, isBest && { color: Colors.riderAccent }]}>
                      {day}
                    </Text>
                    <Text style={styles.deliveryCount}>৳{amount.toLocaleString()} earned</Text>
                  </View>
                </View>
                <View style={styles.listRight}>
                  <Text style={[styles.dayAmount, isBest && { color: Colors.riderAccent }]}>
                    ৳{amount.toLocaleString()}
                  </Text>
                  {isBest && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestBadgeText}>Best</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Spacer for button */}
        <View style={{ height: 20 }} />

      </ScrollView>

      {/* Request Payout Button */}
      <View style={styles.payoutWrapper}>
        <TouchableOpacity
          style={styles.payoutBtn}
          onPress={handleRequestPayout}
          activeOpacity={0.85}
        >
          <Ionicons name="card-outline" size={20} color={Colors.white} />
          <Text style={styles.payoutBtnText}>Request Payout  •  ৳{data.totalEarnings.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RiderEarningsScreen;

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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { padding: 20, paddingBottom: 100 },

  // Summary card
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderTopWidth: 4,
    borderTopColor: Colors.riderAccent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  summaryMainItem: { flex: 1, alignItems: 'center' },
  summaryMainLabel: { fontSize: 13, color: Colors.gray, fontWeight: '600', marginBottom: 4 },
  summaryMainValue: { fontSize: 28, fontWeight: '900', color: Colors.black },
  summaryDividerV: { width: 1, height: 56, backgroundColor: Colors.border },
  summaryDividerH: { height: 1, backgroundColor: Colors.border, marginBottom: 16 },
  summaryBottomRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryMiniItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryMiniValue: { fontSize: 16, fontWeight: '800', color: Colors.black },
  summaryMiniLabel: { fontSize: 11, color: Colors.gray, fontWeight: '500' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.black, marginBottom: 12 },

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
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartPeriod: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  growthText: { fontSize: 13, fontWeight: '700', color: Colors.riderAccent },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 140 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barValueLabel: { fontSize: 9, fontWeight: '600', color: Colors.gray, marginBottom: 2 },
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
  dayName: { fontSize: 14, fontWeight: '700', color: Colors.black },
  deliveryCount: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayAmount: { fontSize: 15, fontWeight: '700', color: Colors.black },
  bestBadge: {
    backgroundColor: Colors.riderAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },

  // Payout
  payoutWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  payoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.riderAccent,
    height: 54,
    borderRadius: 18,
    shadowColor: Colors.riderAccent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  payoutBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});