import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import { useAuth } from '../../../context/AuthContext';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import { useApiData } from '../../../hooks/useApiData';
import { fetchSellerStats } from '../../../services/orderService';
import { fetchMyRestaurant, toggleRestaurantOpen } from '../../../services/restaurantService';
import { ApiError } from '../../../services/apiClient';
import type { SellerStats, Restaurant } from '../../../models';
import type { SellerStackParamList } from '../../../navigation/SellerNavigator';

type NavProp = NativeStackNavigationProp<SellerStackParamList>;

const { width: W } = Dimensions.get('window');

// Mini bar chart
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY_STATS: SellerStats = {
  newOrders: 0,
  preparing: 0,
  completed: 0,
  totalSales: 0,
  weeklyData: [0, 0, 0, 0, 0, 0, 0],
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, bg }) => (
  <View style={[statStyles.card, { borderTopColor: color }]}>
    <View style={[statStyles.iconBox, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={statStyles.value}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  card: {
    width: (W - 60) / 2,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'flex-start',
    gap: 6,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 26, fontWeight: '900', color: Colors.black },
  label: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
});

const SellerDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavProp>();
  const [showLogout, setShowLogout] = useState(false);

  // Restaurant presence gate — new sellers (no restaurant yet) are sent to
  // Restaurant Setup instead of a dashboard full of nothing.
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [gateChecked, setGateChecked] = useState(false);
  const [togglingOpen, setTogglingOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetchMyRestaurant();
        if (mounted) setRestaurant(r);
      } catch (err: unknown) {
        if (mounted && err instanceof ApiError && err.status === 404) {
          navigation.replace('SellerRestaurantSetup');
          return;
        }
        // Backend unreachable — stay on the dashboard with an offline notice.
      } finally {
        if (mounted) setGateChecked(true);
      }
    })();
    return () => { mounted = false; };
  }, [navigation]);

  const statsState = useApiData<SellerStats>(fetchSellerStats, EMPTY_STATS);
  const status = statsState.status;
  const stats = statsState.status !== 'loading' ? statsState.data : EMPTY_STATS;
  const reload = statsState.reload;
  const barData = stats.weeklyData.length === 7 ? stats.weeklyData : EMPTY_STATS.weeklyData;
  const barMax = Math.max(...barData, 1);
  const weeklyTotal = barData.reduce((s, v) => s + v, 0);

  const isOpen = restaurant?.isOpen ?? true;

  if (status === 'loading' && !restaurant) {
    return <LoadingScreen label="Loading your dashboard…" color={Colors.sellerAccent} />;
  }

  const toggleOpen = async () => {
    setTogglingOpen(true);
    try {
      const updated = await toggleRestaurantOpen();
      setRestaurant(updated);
    } catch { /* backend unreachable — keep current state */ }
    finally { setTogglingOpen(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>{user?.restaurantName ?? user?.name} 👨‍🍳</Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={reload} style={styles.refreshBtn}>
            {status === 'loading'
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Ionicons name="refresh-outline" size={20} color={Colors.black} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogout(true)}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Backend offline — live stats unavailable</Text>
          <TouchableOpacity onPress={reload}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Open/Closed toggle */}
        <View style={[styles.statusRow, !isOpen && styles.statusRowClosed]}>
          <View style={[styles.statusDot, !isOpen && styles.statusDotClosed]} />
          <Text style={[styles.statusText, !isOpen && styles.statusTextClosed]}>
            {isOpen ? 'Restaurant is Open' : 'Restaurant is Closed'}
          </Text>
          <TouchableOpacity style={[styles.toggleBtn, !isOpen && styles.toggleBtnClosed]} onPress={toggleOpen} disabled={togglingOpen || !gateChecked}>
            {togglingOpen ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.toggleText}>{isOpen ? 'Close Now' : 'Open Now'}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Stat Cards */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard label="New Orders" value={stats.newOrders} icon="receipt-outline" color="#FF6B00" bg="#FFF3EE" />
          <StatCard label="Preparing" value={stats.preparing} icon="restaurant-outline" color="#FF9800" bg="#FFF3E0" />
          <StatCard label="Completed" value={stats.completed} icon="checkmark-circle-outline" color={Colors.success} bg={Colors.successLight} />
          <StatCard label="Total Sales" value={`৳${stats.totalSales.toLocaleString()}`} icon="cash-outline" color={Colors.sellerAccent} bg={Colors.successLight} />
        </View>

        {/* Weekly Chart */}
        <Text style={styles.sectionTitle}>Weekly Sales</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTotal}>৳{weeklyTotal.toLocaleString()}</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={14} color={Colors.success} />
              <Text style={styles.growthText}>{weeklyTotal} orders</Text>
            </View>
          </View>
          <View style={styles.barsRow}>
            {barData.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (val / barMax) * 90,
                      backgroundColor: i === new Date().getDay() ? Colors.sellerAccent : Colors.successLight,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Manage Orders', icon: 'list-outline' as const, screen: 'SellerOrders' as const, badge: stats.newOrders },
            { label: 'Add Food', icon: 'add-circle-outline' as const, screen: 'SellerAddFood' as const },
            { label: 'Menu', icon: 'restaurant-outline' as const, screen: 'SellerMenu' as const },
            { label: 'Offers', icon: 'pricetag-outline' as const, screen: 'SellerOffers' as const },
            { label: 'Edit Restaurant', icon: 'storefront-outline' as const, screen: 'SellerRestaurantSetup' as const, params: { editing: true } as const },
            { label: 'Sales Report', icon: 'bar-chart-outline' as const, screen: 'SellerSales' as const },
            { label: 'Edit Profile', icon: 'person-outline' as const, screen: 'SellerEditProfile' as const },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen as any, action.params as any)}
              activeOpacity={0.85}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={24} color={Colors.sellerAccent} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              {action.badge !== undefined && action.badge > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{action.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => { setShowLogout(false); logout(); }}
        onCancel={() => setShowLogout(false)}
      />
    </SafeAreaView>
  );
};

export default SellerDashboardScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: { fontSize: 13, color: Colors.gray, fontWeight: '500' },
  name: { fontSize: 20, fontWeight: '900', color: Colors.black },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '700', flex: 1 },
  retryText: { fontSize: 11, color: Colors.warning, fontWeight: '800', textDecorationLine: 'underline' },
  scroll: { padding: 20, paddingBottom: 40 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 8,
  },
  statusRowClosed: { backgroundColor: Colors.errorLight },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  statusDotClosed: { backgroundColor: Colors.error },
  statusText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.success },
  statusTextClosed: { color: Colors.error },
  toggleBtn: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleBtnClosed: { backgroundColor: Colors.error },
  toggleText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 12,
    marginTop: 4,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
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
  chartTotal: { fontSize: 24, fontWeight: '900', color: Colors.black },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  growthText: { fontSize: 13, fontWeight: '700', color: Colors.success },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 110 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: (W - 52) / 2,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute', top: 8, right: 8,
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.sellerAccent, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
  },
  actionBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: Colors.black, textAlign: 'center' },
});
