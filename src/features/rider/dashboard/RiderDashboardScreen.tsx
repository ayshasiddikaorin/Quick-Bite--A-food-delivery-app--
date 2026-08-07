import React, { useState, useCallback } from 'react';
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
import type { RiderStackParamList } from '../../../navigation/RiderNavigator';
import { useApiData } from '../../../hooks/useApiData';
import { fetchRiderStats, toggleOnline } from '../../../services/riderService';
import type { RiderStats } from '../../../services/riderService';

type NavProp = NativeStackNavigationProp<RiderStackParamList>;
const { width: W } = Dimensions.get('window');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DUMMY_STATS: RiderStats = {
  newRequests: 3,
  activeDeliveries: 1,
  todayIncome: 480,
  weeklyData: [320, 480, 290, 550, 410, 620, 480],
  isOnline: false,
};

const StatCard: React.FC<{
  label: string; value: string | number;
  icon: keyof typeof Ionicons.glyphMap; color: string; bg: string;
}> = ({ label, value, icon, color, bg }) => (
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
    width: (W - 60) / 2, backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    alignItems: 'flex-start', gap: 6, borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  iconBox: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 26, fontWeight: '900', color: Colors.black },
  label: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
});

const QUICK_ACTIONS = [
  { label: 'View Requests',    icon: 'list-outline'    as const, screen: 'RiderRequests'        as const },
  { label: 'Delivery History', icon: 'time-outline'    as const, screen: 'RiderDeliveryHistory' as const },
  { label: 'Earnings',         icon: 'cash-outline'    as const, screen: 'RiderEarnings'        as const },
  { label: 'Active Delivery',  icon: 'bicycle-outline' as const, screen: 'RiderRequests'        as const },
];

const RiderDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavProp>();
  const [showLogout, setShowLogout] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);

  const { status, data: stats, reload } = useApiData<RiderStats>(fetchRiderStats, DUMMY_STATS);
  const s = status !== 'loading' ? stats : DUMMY_STATS;

  const [isOnline, setIsOnline] = useState(s.isOnline);

  const handleToggleOnline = useCallback(async () => {
    setTogglingOnline(true);
    try {
      await toggleOnline();
      setIsOnline((prev) => !prev);
      reload();
    } catch {
      // API unavailable — toggle locally
      setIsOnline((prev) => !prev);
    } finally {
      setTogglingOnline(false);
    }
  }, [reload]);

  const barData = s.weeklyData ?? DUMMY_STATS.weeklyData;
  const maxVal  = Math.max(...barData, 1);
  const weeklyTotal = barData.reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hello, Rider</Text>
          <Text style={styles.name}>{user?.name ?? 'Karim'} 🏍️</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.refreshBtn} onPress={reload}>
            {status === 'loading'
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Ionicons name="refresh-outline" size={18} color={Colors.black} />}
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
            <Text style={styles.fallbackText}>Offline preview · tap refresh to load live stats</Text>
          </View>
        )}

        {/* Online/Offline Toggle */}
        <View style={[styles.onlineCard, { backgroundColor: isOnline ? '#E8F5E9' : Colors.lightGray }]}>
          <View style={styles.onlineLeft}>
            <View style={[styles.onlineDot, { backgroundColor: isOnline ? Colors.success : Colors.gray }]} />
            <View>
              <Text style={[styles.onlineStatus, { color: isOnline ? Colors.success : Colors.gray }]}>
                {isOnline ? 'You are Online' : 'You are Offline'}
              </Text>
              <Text style={styles.onlineSubText}>
                {isOnline ? 'Ready to receive delivery requests' : 'Go online to receive orders'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: isOnline ? Colors.success : Colors.gray }]}
            onPress={handleToggleOnline}
            disabled={togglingOnline}
            activeOpacity={0.85}
          >
            {togglingOnline
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Text style={styles.toggleText}>{isOnline ? 'Go Offline' : 'Go Online'}</Text>}
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard label="New Requests"      value={s.newRequests}                       icon="notifications-outline" color={Colors.riderAccent} bg={Colors.infoLight}   />
          <StatCard label="Active Deliveries" value={s.activeDeliveries}                  icon="bicycle-outline"       color={Colors.warning}     bg="#FFF8E1"             />
          <StatCard label="Today's Income"    value={`৳${s.todayIncome.toLocaleString()}`} icon="cash-outline"          color={Colors.success}     bg={Colors.successLight} />
          <StatCard label="This Week"         value={`৳${weeklyTotal.toLocaleString()}`}   icon="trending-up-outline"   color={Colors.riderAccent} bg={Colors.infoLight}   />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.85}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={24} color={Colors.riderAccent} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Earnings Chart */}
        <Text style={styles.sectionTitle}>Weekly Earnings</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTotal}>৳{weeklyTotal.toLocaleString()}</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={14} color={Colors.riderAccent} />
              <Text style={styles.growthText}>This week</Text>
            </View>
          </View>
          <View style={styles.barsRow}>
            {barData.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, { height: (val / maxVal) * 90, backgroundColor: i === 5 ? Colors.riderAccent : Colors.infoLight }]} />
                <Text style={styles.barLabel}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
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

export default RiderDashboardScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  greeting: { fontSize: 13, color: Colors.gray, fontWeight: '500' },
  name: { fontSize: 20, fontWeight: '900', color: Colors.black },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '600', flex: 1 },
  onlineCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24, gap: 8,
  },
  onlineLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  onlineDot: { width: 12, height: 12, borderRadius: 6 },
  onlineStatus: { fontSize: 14, fontWeight: '700' },
  onlineSubText: { fontSize: 12, color: Colors.gray, marginTop: 2 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, minWidth: 90, alignItems: 'center' },
  toggleText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.black, marginBottom: 12, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: {
    width: (W - 52) / 2, backgroundColor: Colors.white, borderRadius: 18, padding: 18, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  actionIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.infoLight, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '700', color: Colors.black, textAlign: 'center' },
  chartCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 18, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  chartTotal: { fontSize: 24, fontWeight: '900', color: Colors.black },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.infoLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  growthText: { fontSize: 13, fontWeight: '700', color: Colors.riderAccent },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 110 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
});
