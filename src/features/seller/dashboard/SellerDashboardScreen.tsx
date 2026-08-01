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
import type { SellerStackParamList } from '../../../navigation/SellerNavigator';

type NavProp = NativeStackNavigationProp<SellerStackParamList>;

const { width: W } = Dimensions.get('window');

// Mini bar chart
const BAR_DATA = [42, 68, 55, 80, 73, 90, 65];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VAL = Math.max(...BAR_DATA);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>{user?.restaurantName ?? user?.name} 👨‍🍳</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogout(true)}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Open/Closed toggle */}
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Restaurant is Open</Text>
          <TouchableOpacity style={styles.toggleBtn}>
            <Text style={styles.toggleText}>Close Now</Text>
          </TouchableOpacity>
        </View>

        {/* Stat Cards */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard label="New Orders" value={8} icon="receipt-outline" color="#FF6B00" bg="#FFF3EE" />
          <StatCard label="Preparing" value={3} icon="restaurant-outline" color="#FF9800" bg="#FFF3E0" />
          <StatCard label="Completed" value={24} icon="checkmark-circle-outline" color={Colors.success} bg={Colors.successLight} />
          <StatCard label="Total Sales" value="৳4,280" icon="cash-outline" color={Colors.sellerAccent} bg={Colors.successLight} />
        </View>

        {/* Weekly Chart */}
        <Text style={styles.sectionTitle}>Weekly Sales</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTotal}>৳28,540</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={14} color={Colors.success} />
              <Text style={styles.growthText}>+12.5%</Text>
            </View>
          </View>
          <View style={styles.barsRow}>
            {BAR_DATA.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (val / MAX_VAL) * 90,
                      backgroundColor: i === 5 ? Colors.sellerAccent : Colors.successLight,
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
            { label: 'Manage Orders', icon: 'list-outline' as const, screen: 'SellerOrders' as const },
            { label: 'Add Food', icon: 'add-circle-outline' as const, screen: 'SellerAddFood' as const },
            { label: 'Menu', icon: 'restaurant-outline' as const, screen: 'SellerMenu' as const },
            { label: 'Sales Report', icon: 'bar-chart-outline' as const, screen: 'SellerSales' as const },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen as any)}
              activeOpacity={0.85}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={24} color={Colors.sellerAccent} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
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
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  statusText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.success },
  toggleBtn: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
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
  },
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
