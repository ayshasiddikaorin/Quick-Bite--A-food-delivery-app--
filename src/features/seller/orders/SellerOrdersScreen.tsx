import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import { useApiData } from '../../../hooks/useApiData';
import { fetchSellerOrders, advanceOrderSeller } from '../../../services/orderService';
import type { Order, OrderStatus } from '../../../models';

const EMPTY_ORDERS: Order[] = [];

type TabKey = 'new' | 'preparing' | 'completed';

const STATUS_MAP: Record<TabKey, OrderStatus[]> = {
  new:       ['pending', 'confirmed'],
  preparing: ['preparing', 'ready'],
  completed: ['delivered', 'cancelled'],
};

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: 'new',       label: 'New',       color: Colors.primary  },
  { key: 'preparing', label: 'Preparing', color: Colors.warning  },
  { key: 'completed', label: 'Completed', color: Colors.success  },
];

const SellerOrdersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab]     = useState<TabKey>('new');
  const [confirmId, setConfirmId]     = useState<string | null>(null);
  const [advancing, setAdvancing]     = useState(false);

  const { status, data: orders, reload } = useApiData<Order[]>(fetchSellerOrders, EMPTY_ORDERS);
  const liveOrders = status !== 'loading' ? orders : EMPTY_ORDERS;

  // Refresh whenever the screen regains focus (e.g. after a new order arrives)
  useFocusEffect(
    React.useCallback(() => { reload(); }, [reload]),
  );

  const filtered = liveOrders.filter((o) => STATUS_MAP[activeTab].includes(o.status));
  const tabCfg   = TABS.find((t) => t.key === activeTab)!;

  const handleAdvance = useCallback(async () => {
    if (!confirmId) return;
    setAdvancing(true);
    try {
      await advanceOrderSeller(confirmId);
      reload();
    } catch { /* server not reachable — UI stays on fallback */ }
    finally { setAdvancing(false); setConfirmId(null); }
  }, [confirmId, reload]);

  const formatTime = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    return diff < 60 ? `${diff} min ago` : `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Management</Text>
        <TouchableOpacity onPress={reload} style={styles.backBtn}>
          {status === 'loading'
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : <Ionicons name="refresh-outline" size={20} color={Colors.black} />}
        </TouchableOpacity>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="wifi-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Backend offline · live orders unavailable</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && { borderBottomColor: t.color, borderBottomWidth: 2.5 }]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && { color: t.color, fontWeight: '800' }]}>
              {t.label}
            </Text>
            <View style={[styles.tabBadge, { backgroundColor: t.color + '22' }]}>
              <Text style={[styles.tabBadgeText, { color: t.color }]}>
                {liveOrders.filter((o) => STATUS_MAP[t.key].includes(o.status)).length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={52} color={Colors.border} />
            <Text style={styles.emptyText}>No {activeTab} orders</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderTop}>
              <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.orderTime}>{formatTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.customer}>{item.customerName}</Text>
            <Text style={styles.orderItems}>
              {item.items.map((i) => `${i.name} x${i.quantity}`).join(', ') || 'Items details unavailable'}
            </Text>
            <View style={styles.orderBottom}>
              <Text style={styles.orderTotal}>৳{item.total.toFixed(0)}</Text>
              {activeTab === 'new' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: tabCfg.color }]} onPress={() => setConfirmId(item.id)}>
                  <Text style={styles.actionText}>Accept</Text>
                </TouchableOpacity>
              )}
              {activeTab === 'preparing' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.warning }]} onPress={() => setConfirmId(item.id)}>
                  <Text style={styles.actionText}>Mark Ready</Text>
                </TouchableOpacity>
              )}
              {activeTab === 'completed' && (
                <View style={styles.doneBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={[styles.actionText, { color: Colors.success }]}>Done</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />

      <ConfirmModal
        visible={!!confirmId}
        title={activeTab === 'new' ? 'Accept Order' : 'Mark as Ready?'}
        message={`Order will be ${activeTab === 'new' ? 'accepted and moved to Preparing' : 'marked as ready for pickup'}.`}
        confirmText={advancing ? 'Updating…' : 'Confirm'}
        cancelText="Cancel"
        variant="success"
        onConfirm={handleAdvance}
        onCancel={() => setConfirmId(null)}
      />
    </SafeAreaView>
  );
};

export default SellerOrdersScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 60, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '600', flex: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderBottomColor: 'transparent', borderBottomWidth: 2.5,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
  tabBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tabBadgeText: { fontSize: 11, fontWeight: '800' },
  list: { padding: 20, gap: 14 },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: Colors.border,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { fontSize: 15, fontWeight: '800', color: Colors.black },
  orderTime: { fontSize: 12, color: Colors.gray },
  customer: { fontSize: 14, fontWeight: '700', color: Colors.darkGray },
  orderItems: { fontSize: 13, color: Colors.gray },
  orderBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  orderTotal: { fontSize: 17, fontWeight: '900', color: Colors.sellerAccent },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  actionText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.gray, fontWeight: '600' },
});
