import React, { useState } from 'react';
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
import type { AdminStackParamList } from '../../../navigation/AdminNavigator';
import type { UserRole, AdminStats } from '../../../models';
import { useApiData } from '../../../hooks/useApiData';
import { fetchAdminStats } from '../../../services/adminService';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;
const { width: W } = Dimensions.get('window');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── Dummy fallback stats ──────────────────────────────────────────────────────
const DUMMY_STATS: AdminStats = {
  totalUsers: 1284,
  totalRestaurants: 96,
  totalRiders: 143,
  totalOrders: 8472,
  completedOrders: 5761,
  pendingOrders: 1185,
  cancelledOrders: 508,
  onDeliveryOrders: 1018,
  totalRevenue: 0,
  weeklyOrderData: [120, 145, 98, 167, 134, 189, 156],
};

// ── Sub-components ────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string; value: string | number;
  icon: keyof typeof Ionicons.glyphMap; color: string; bg: string;
}> = ({ label, value, icon, color, bg }) => (
  <View style={[statStyles.card, { borderLeftColor: color }]}>
    <View style={[statStyles.iconBox, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  </View>
);

const statStyles = StyleSheet.create({
  card: {
    width: (W - 52) / 2, backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  iconBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 22, fontWeight: '900', color: Colors.black },
  label: { fontSize: 11, color: Colors.gray, fontWeight: '600', marginTop: 2 },
});

const RoleCard: React.FC<{
  role: UserRole; label: string; description: string;
  icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; onSwitch: () => void;
}> = ({ label, description, icon, color, bg, onSwitch }) => (
  <TouchableOpacity style={[roleStyles.card, { borderTopColor: color }]} onPress={onSwitch} activeOpacity={0.85}>
    <View style={[roleStyles.iconBox, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={roleStyles.label}>{label}</Text>
    <Text style={roleStyles.desc}>{description}</Text>
    <View style={[roleStyles.badge, { backgroundColor: bg }]}>
      <Text style={[roleStyles.badgeText, { color }]}>Switch View</Text>
    </View>
  </TouchableOpacity>
);

const roleStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    alignItems: 'center', gap: 6, borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  iconBox: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '800', color: Colors.black },
  desc: { fontSize: 11, color: Colors.gray, textAlign: 'center', fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

const QuickNavCard: React.FC<{
  label: string; icon: keyof typeof Ionicons.glyphMap;
  color: string; bg: string; onPress: () => void;
}> = ({ label, icon, color, bg, onPress }) => (
  <TouchableOpacity style={quickStyles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={[quickStyles.iconBox, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={quickStyles.label}>{label}</Text>
    <Ionicons name="chevron-forward" size={14} color={Colors.gray} />
  </TouchableOpacity>
);

const quickStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.white,
    borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  iconBox: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.black },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
const AdminDashboardScreen: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigation = useNavigation<NavProp>();
  const [showLogout, setShowLogout] = useState(false);

  const { status, data: stats, reload } = useApiData<AdminStats>(fetchAdminStats, DUMMY_STATS);
  const s = status !== 'loading' ? stats : DUMMY_STATS;

  const barData  = s.weeklyOrderData ?? DUMMY_STATS.weeklyOrderData;
  const maxVal   = Math.max(...barData, 1);
  const total    = s.completedOrders + s.pendingOrders + s.cancelledOrders + s.onDeliveryOrders || 1;

  const ORDER_STATUS = [
    { label: 'Completed',   percent: Math.round((s.completedOrders  / total) * 100), color: Colors.success     },
    { label: 'On Delivery', percent: Math.round((s.onDeliveryOrders / total) * 100), color: Colors.riderAccent },
    { label: 'Pending',     percent: Math.round((s.pendingOrders    / total) * 100), color: Colors.warning     },
    { label: 'Cancelled',   percent: Math.round((s.cancelledOrders  / total) * 100), color: Colors.error       },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Platform Control</Text>
          <Text style={styles.name}>{user?.name ?? 'Admin'} ⚙️</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={reload}>
            {status === 'loading'
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Ionicons name="refresh-outline" size={20} color={Colors.black} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogout(true)} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {status === 'fallback' && (
          <View style={styles.fallbackBanner}>
            <Ionicons name="wifi-outline" size={13} color={Colors.warning} />
            <Text style={styles.fallbackText}>Showing offline preview · tap refresh for live stats</Text>
          </View>
        )}

        {/* Switch Role */}
        <Text style={styles.sectionTitle}>Switch Role View</Text>
        <Text style={styles.sectionSubTitle}>Preview the app from each user's perspective</Text>
        <View style={styles.rolesRow}>
          <RoleCard role="buyer"  label="Buyer"  description="Customer view"   icon="bag-outline"        color={Colors.buyerAccent}  bg="#FFF3EE"           onSwitch={() => switchRole('buyer')}  />
          <RoleCard role="seller" label="Seller" description="Restaurant view" icon="storefront-outline"  color={Colors.sellerAccent} bg={Colors.successLight} onSwitch={() => switchRole('seller')} />
          <RoleCard role="rider"  label="Rider"  description="Delivery view"   icon="bicycle-outline"    color={Colors.riderAccent}  bg={Colors.infoLight}  onSwitch={() => switchRole('rider')}  />
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Platform Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Total Users"   value={s.totalUsers.toLocaleString()}   icon="people-outline"      color={Colors.riderAccent}  bg={Colors.infoLight}   />
          <StatCard label="Restaurants"   value={s.totalRestaurants}              icon="storefront-outline"  color={Colors.sellerAccent} bg={Colors.successLight} />
          <StatCard label="Riders"        value={s.totalRiders}                   icon="bicycle-outline"     color={Colors.warning}      bg="#FFF8E1"             />
          <StatCard label="Total Orders"  value={s.totalOrders.toLocaleString()}  icon="receipt-outline"     color={Colors.adminAccent}  bg="#F3E5F5"             />
        </View>

        {/* Order breakdown */}
        <Text style={styles.sectionTitle}>Order Status Breakdown</Text>
        <View style={styles.pieCard}>
          <View style={styles.horizontalBar}>
            {ORDER_STATUS.map((item, i) => (
              <View key={item.label} style={{
                width: `${item.percent}%`, height: 18, backgroundColor: item.color,
                ...(i === 0 ? { borderTopLeftRadius: 9, borderBottomLeftRadius: 9 } : {}),
                ...(i === ORDER_STATUS.length - 1 ? { borderTopRightRadius: 9, borderBottomRightRadius: 9 } : {}),
              }} />
            ))}
          </View>
          <View style={styles.legendRow}>
            {ORDER_STATUS.map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={[styles.legendPercent, { color: item.color }]}>{item.percent}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly chart */}
        <Text style={styles.sectionTitle}>Weekly Orders</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTotal}>{s.totalOrders.toLocaleString()} orders</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={14} color={Colors.adminAccent} />
              <Text style={styles.growthText}>This week</Text>
            </View>
          </View>
          <View style={styles.barsRow}>
            {barData.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barValueLabel}>{val}</Text>
                <View style={[styles.bar, { height: (val / maxVal) * 100, backgroundColor: i === 5 ? Colors.adminAccent : '#E1BEE7' }]} />
                <Text style={[styles.barLabel, i === 5 && { color: Colors.adminAccent, fontWeight: '700' }]}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick nav */}
        <Text style={styles.sectionTitle}>Quick Navigation</Text>
        <QuickNavCard label="Manage Users"  icon="people-outline"     color={Colors.riderAccent}  bg={Colors.infoLight}    onPress={() => navigation.navigate('AdminUsers')}       />
        <QuickNavCard label="Restaurants"   icon="storefront-outline" color={Colors.sellerAccent} bg={Colors.successLight} onPress={() => navigation.navigate('AdminRestaurants')} />
        <QuickNavCard label="All Orders"    icon="receipt-outline"    color={Colors.adminAccent}  bg="#F3E5F5"             onPress={() => navigation.navigate('AdminOrders')}       />
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

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  greeting: { fontSize: 13, color: Colors.gray, fontWeight: '500' },
  name: { fontSize: 20, fontWeight: '900', color: Colors.black },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '600', flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.black, marginBottom: 6, marginTop: 8 },
  sectionSubTitle: { fontSize: 12, color: Colors.gray, fontWeight: '500', marginBottom: 14 },
  rolesRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, marginTop: 12 },
  pieCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 18, marginBottom: 24, marginTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  horizontalBar: { flexDirection: 'row', height: 18, borderRadius: 9, overflow: 'hidden', marginBottom: 18 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: Colors.darkGray, fontWeight: '500' },
  legendPercent: { fontSize: 12, fontWeight: '700' },
  chartCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 18, marginBottom: 24, marginTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  chartTotal: { fontSize: 20, fontWeight: '900', color: Colors.black },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3E5F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  growthText: { fontSize: 13, fontWeight: '700', color: Colors.adminAccent },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 130 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barValueLabel: { fontSize: 9, fontWeight: '600', color: Colors.gray, marginBottom: 2 },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: Colors.gray, fontWeight: '600', marginTop: 4 },
});
