import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ProfileCard from './ProfileCard';
import PromoBanner from '../../../components/PromoBanner';
import WalletCard from '../../../components/WalletCard';
import MenuItem from '../../../components/MenuItem';
import ConfirmModal from '../../../components/shared/ConfirmModal';

import { menuGroups } from '../../../data/accountData';
import Colors from '../../../constants/colors';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useApiData } from '../../../hooks/useApiData';
import { fetchMyOrders } from '../../../services/orderService';
import type { UserProfile, Order, OrderStatus } from '../../../models';
import type { BuyerStackParamList } from '../../../navigation/BuyerNavigator';

type NavProp = NativeStackNavigationProp<BuyerStackParamList>;

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'on_the_way', 'reached'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  assigned: 'Rider Assigned',
  on_the_way: 'On the Way',
  reached: 'Rider Arrived',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: Colors.warning,
  confirmed: Colors.success,
  preparing: Colors.info,
  ready: Colors.riderAccent,
  assigned: Colors.warning,
  on_the_way: Colors.primary,
  reached: Colors.riderAccent,
  delivered: Colors.success,
  cancelled: Colors.error,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const BuyerAccountScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user, logout, refreshProfile } = useAuth();
  const { showPopup } = useNotifications();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: orders } = useApiData<Order[]>(
    user ? fetchMyOrders : async () => [],
    [],
    [user],
  );

  const activeOrder = orders.find((o) => ACTIVE_STATUSES.includes(o.status));
  const history = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled').slice(0, 3);

  const trackOrder = (order: Order) => {
    navigation.navigate('OrderTracking', {
      orderId: order.id,
      paymentMethod: order.paymentMethod,
      total: order.total,
      address: order.address,
      deliveryType: order.deliveryType,
      isDummy: false,
    });
  };

  const promptLogin = () => {
    showPopup({
      title: 'Sign in required',
      message: 'Please sign in as a buyer to continue.',
      variant: 'warning',
      confirmText: 'Sign In',
      cancelText: 'Not Now',
      showCancel: true,
      onConfirm: () => navigation.navigate('RoleSelect'),
    });
  };

  // Build a UserProfile from the live AuthUser — falls back to zeroes while loading
  const profile: UserProfile = user
    ? {
        id:            user.userId,
        name:          user.name,
        email:         user.email,
        phone:         user.phone,
        avatar:        user.avatar,
        memberSince:   user.memberSince
          ? `Member since ${new Date(user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
          : 'New Member',
        totalOrders:   user.totalOrders,
        loyaltyPoints: user.loyaltyPoints,
        walletBalance: user.walletBalance,
        isPremium:     user.isPremium,
      }
    : {
        id: '', name: '—', email: '—', phone: '—', avatar: '',
        memberSince: '', totalOrders: 0, loyaltyPoints: 0,
        walletBalance: 0, isPremium: false,
      };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshProfile(); } catch { /* silent */ }
    finally { setRefreshing(false); }
  };

  const openMenu = (menuId: string) => {
    if (!user) { promptLogin(); return; }
    switch (menuId) {
      case 'my-orders':     navigation.navigate('BuyerMyOrders'); break;
      case 'favorites':     navigation.navigate('BuyerFavorites'); break;
      case 'notifications': navigation.navigate('BuyerNotifications'); break;
      default: break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.accent} />
          <Text style={styles.topBarTitle}>Account</Text>
        </View>
        <View style={styles.topBarRight}>
          {refreshing && (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />
          )}
          <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.75} onPress={handleRefresh}>
            <Ionicons name="refresh-outline" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!user ? (
          <View style={styles.guestCard}>
            <View style={styles.guestIconBox}>
              <Ionicons name="person-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.guestTitle}>Welcome, Guest</Text>
            <Text style={styles.guestSub}>
              Sign in to access your favorites, orders, and exclusive offers.
            </Text>
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => navigation.navigate('RoleSelect')}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={18} color={Colors.white} />
              <Text style={styles.guestBtnText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Profile card uses live data from AuthContext */}
            <ProfileCard user={profile} />

            <PromoBanner loyaltyPoints={profile.loyaltyPoints} />

            <WalletCard balance={profile.walletBalance} />
          </>
        )}

        {/* ── Active Order ─────────────────────────────────────────────── */}
        {activeOrder && (
          <View style={styles.menuSection}>
            <Text style={styles.groupTitle}>Active Order</Text>
            <View style={styles.liveCard}>
              <View style={styles.liveTop}>
                <View style={styles.liveIconBox}>
                  <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.liveInfo}>
                  <Text style={styles.liveTitle}>{activeOrder.restaurantName}</Text>
                  <Text style={styles.liveSub}>
                    #{activeOrder.id.slice(-6).toUpperCase()} · {activeOrder.items.reduce((s, i) => s + i.quantity, 0)} items
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[activeOrder.status] + '22' }]}>
                  <Text style={[styles.statusPillText, { color: STATUS_COLOR[activeOrder.status] }]}>
                    {STATUS_LABEL[activeOrder.status]}
                  </Text>
                </View>
              </View>
              <View style={styles.liveBottom}>
                <Text style={styles.liveTotal}>৳{activeOrder.total.toFixed(0)}</Text>
                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() => trackOrder(activeOrder)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="navigate-outline" size={14} color={Colors.white} />
                  <Text style={styles.trackBtnText}>Track Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── Order History ────────────────────────────────────────────── */}
        {history.length > 0 && (
          <View style={styles.menuSection}>
            <Text style={styles.groupTitle}>Order History</Text>
            <View style={styles.historyCard}>
              {history.map((order, index) => (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.historyRow, index > 0 && { borderTopWidth: 1, borderTopColor: Colors.border }]}
                  onPress={() => trackOrder(order)}
                  activeOpacity={0.7}
                >
                  <View style={styles.historyMain}>
                    <Text style={styles.historyRestaurant} numberOfLines={1}>{order.restaurantName}</Text>
                    <Text style={styles.historyMeta}>
                      {formatDate(order.createdAt)} · #{order.id.slice(-6).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyTotal}>৳{order.total.toFixed(0)}</Text>
                    <Text style={[styles.historyStatus, { color: STATUS_COLOR[order.status] }]}>
                      {STATUS_LABEL[order.status]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {menuGroups.map((group) => (
          <View key={group.id} style={styles.menuSection}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, index) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === group.items.length - 1}
                  onPress={() => openMenu(item.id)}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.logoutSection}>
          {user && (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => setShowLogoutModal(true)}
              activeOpacity={0.85}
            >
              <View style={styles.logoutIconBg}>
                <Ionicons name="log-out-outline" size={18} color={Colors.error} />
              </View>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.versionBox}>
          <Text style={styles.versionText}>Quick Bite v1.0.0</Text>
          <Text style={styles.versionSub}>Made with ❤️ for food lovers</Text>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
};

export default BuyerAccountScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topBarRight: { flexDirection: 'row', alignItems: 'center' },
  accent: { width: 4, height: 22, borderRadius: 2, backgroundColor: Colors.primary },
  topBarTitle: { fontSize: 22, fontWeight: '800', color: Colors.black },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { paddingBottom: 24 },
  guestCard: {
    marginTop: 22,
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  guestTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  guestSub: { fontSize: 13, color: Colors.gray, textAlign: 'center', lineHeight: 19, marginBottom: 4 },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  guestBtnText: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  menuSection: { marginTop: 22, paddingHorizontal: 20 },
  groupTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.gray,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginLeft: 4,
  },
  menuCard: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  logoutSection: { paddingHorizontal: 20, marginTop: 22 },
  liveCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: Colors.border,
  },
  liveTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
  },
  liveInfo: { flex: 1, gap: 2 },
  liveTitle: { fontSize: 14, fontWeight: '700', color: Colors.black },
  liveSub: { fontSize: 12, color: Colors.gray, lineHeight: 17 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  liveBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  liveTotal: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  trackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12,
  },
  trackBtnText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  historyCard: {
    backgroundColor: Colors.white, borderRadius: 18, overflow: 'hidden',
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16, gap: 10,
  },
  historyMain: { flex: 1, gap: 2 },
  historyRestaurant: { fontSize: 14, fontWeight: '700', color: Colors.black },
  historyMeta: { fontSize: 11, color: Colors.gray },
  historyRight: { alignItems: 'flex-end', gap: 2 },
  historyTotal: { fontSize: 14, fontWeight: '800', color: Colors.black },
  historyStatus: { fontSize: 11, fontWeight: '700' },
  addressCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: Colors.border,
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, borderRadius: 18,
    paddingVertical: 14, paddingHorizontal: 16,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: Colors.errorLight,
  },
  logoutIconBg: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: Colors.error },
  versionBox: { alignItems: 'center', marginTop: 24, marginBottom: 4, gap: 4 },
  versionText: { fontSize: 12, fontWeight: '600', color: Colors.gray },
  versionSub: { fontSize: 11, color: Colors.gray },
});
