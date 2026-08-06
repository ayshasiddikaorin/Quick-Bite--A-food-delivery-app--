import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import { useAuth } from '../../../context/AuthContext';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import type { AdminStackParamList } from '../../../navigation/AdminNavigator';
import type { UserRole } from '../../../models';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;

const { width: W } = Dimensions.get('window');

const BAR_DATA = [120, 145, 98, 167, 134, 189, 156];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VAL = Math.max(...BAR_DATA);

// ─── Pie bar data ─────────────────────────────────────────────────────────────
const ORDER_STATUS = [
  { label: 'Completed', percent: 68, color: Colors.success },
  { label: 'On Delivery', percent: 12, color: Colors.riderAccent },
  { label: 'Pending', percent: 14, color: Colors.warning },
  { label: 'Cancelled', percent: 6, color: Colors.error },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, bg }) => (
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
    width: (W - 52) / 2,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 22, fontWeight: '900', color: Colors.black },
  label: { fontSize: 11, color: Colors.gray, fontWeight: '600', marginTop: 2 },
});

// ─── Role switch card ─────────────────────────────────────────────────────────
interface RoleCardProps {
  role: UserRole;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  onSwitch: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ label, description, icon, color, bg, onSwitch }) => (
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
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: { fontSize: 14, fontWeight: '800', color: Colors.black },
  desc: { fontSize: 11, color: Colors.gray, textAlign: 'center', fontWeight: '500' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

// ─── Quick nav card ───────────────────────────────────────────────────────────
interface QuickNavCardProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  onPress: () => void;
}

const QuickNavCard: React.FC<QuickNavCardProps> = ({ label, icon, color, bg, onPress }) => (
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.black },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
const AdminDashboardScreen: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigation = useNavigation<NavProp>();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Platform Control</Text>
          <Text style={styles.name}>{user?.name ?? 'Admin'} ⚙️</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogout(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Switch Role View */}
        <Text style={styles.sectionTitle}>Switch Role View</Text>
        <Text style={styles.sectionSubTitle}>Preview the app from each user's perspective</Text>
        <View style={styles.rolesRow}>
          <RoleCard
            role="buyer"
            label="Buyer"
            description="Customer view"
            icon="bag-outline"
            color={Colors.buyerAccent}
            bg="#FFF3EE"
            onSwitch={() => switchRole('buyer')}
          />
          <RoleCard
            role="seller"
            label="Seller"
            description="Restaurant view"
            icon="storefront-outline"
            color={Colors.sellerAccent}
            bg={Colors.successLight}
            onSwitch={() => switchRole('seller')}
          />
          <RoleCard
            role="rider"
            label="Rider"
            description="Delivery view"
            icon="bicycle-outline"
            color={Colors.riderAccent}
            bg={Colors.infoLight}
            onSwitch={() => switchRole('rider')}
          />
        </View>

        {/* Platform Stats */}
        <Text style={styles.sectionTitle}>Platform Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Users"
            value="1,284"
            icon="people-outline"
            color={Colors.riderAccent}
            bg={Colors.infoLight}
          />
          <StatCard
            label="Restaurants"
            value={96}
            icon="storefront-outline"
            color={Colors.sellerAccent}
            bg={Colors.successLight}
          />
          <StatCard
            label="Riders"
            value={143}
            icon="bicycle-outline"
            color={Colors.warning}
            bg="#FFF8E1"
          />
          <StatCard
            label="Total Orders"
            value="8,472"
            icon="receipt-outline"
            color={Colors.adminAccent}
            bg="#F3E5F5"
          />
        </View>

        {/* Order Status Breakdown */}
        <Text style={styles.sectionTitle}>Order Status Breakdown</Text>
        <View style={styles.pieCard}>
          {/* Horizontal bar breakdown */}
          <View style={styles.horizontalBar}>
            {ORDER_STATUS.map((item) => (
              <View
                key={item.label}
                style={{
                  width: `${item.percent}%`,
                  height: 18,
                  backgroundColor: item.color,
                  ...(item.label === 'Completed' ? { borderTopLeftRadius: 9, borderBottomLeftRadius: 9 } : {}),
                  ...(item.label === 'Cancelled' ? { borderTopRightRadius: 9, borderBottomRightRadius: 9 } : {}),
                }}
              />
            ))}
          </View>

          {/* Legend */}
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

        {/* Weekly Orders Chart */}
        <Text style={styles.sectionTitle}>Weekly Orders</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTotal}>8,472 orders</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={14} color={Colors.adminAccent} />
              <Text style={styles.growthText}>+15.2%</Text>
            </View>
          </View>
          <View style={styles.barsRow}>
            {BAR_DATA.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barValueLabel}>{val}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (val / MAX_VAL) * 100,
                      backgroundColor: i === 5 ? Colors.adminAccent : '#E1BEE7',
                    },
                  ]}
                />
                <Text style={[styles.barLabel, i === 5 && { color: Colors.adminAccent, fontWeight: '700' }]}>
                  {DAYS[i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Navigation */}
        <Text style={styles.sectionTitle}>Quick Navigation</Text>
        <QuickNavCard
          label="Manage Users"
          icon="people-outline"
          color={Colors.riderAccent}
          bg={Colors.infoLight}
          onPress={() => navigation.navigate('AdminUsers')}
        />
        <QuickNavCard
          label="Restaurants"
          icon="storefront-outline"
          color={Colors.sellerAccent}
          bg={Colors.successLight}
          onPress={() => navigation.navigate('AdminRestaurants')}
        />
        <QuickNavCard
          label="Riders"
          icon="bicycle-outline"
          color={Colors.warning}
          bg="#FFF8E1"
          onPress={() => navigation.navigate('AdminUsers')}
        />
        <QuickNavCard
          label="All Orders"
          icon="receipt-outline"
          color={Colors.adminAccent}
          bg="#F3E5F5"
          onPress={() => navigation.navigate('AdminOrders')}
        />
        <QuickNavCard
          label="Payments"
          icon="card-outline"
          color={Colors.success}
          bg={Colors.successLight}
          onPress={() => navigation.navigate('AdminOrders')}
        />
        <QuickNavCard
          label="Reviews"
          icon="star-outline"
          color={Colors.warning}
          bg="#FFF8E1"
          onPress={() => navigation.navigate('AdminOrders')}
        />

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
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 6,
    marginTop: 8,
  },
  sectionSubTitle: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
    marginBottom: 14,
  },

  // Roles row
  rolesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, marginTop: 12 },

  // Pie card
  pieCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  horizontalBar: {
    flexDirection: 'row',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    marginBottom: 18,
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: Colors.darkGray, fontWeight: '500' },
  legendPercent: { fontSize: 12, fontWeight: '700' },

  // Chart
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    marginTop: 12,
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
  chartTotal: { fontSize: 20, fontWeight: '900', color: Colors.black },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  growthText: { fontSize: 13, fontWeight: '700', color: Colors.adminAccent },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 130 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barValueLabel: { fontSize: 9, fontWeight: '600', color: Colors.gray, marginBottom: 2 },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: Colors.gray, fontWeight: '600', marginTop: 4 },
});
