import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';

type TabKey = 'new' | 'preparing' | 'completed';

interface OrderItem {
  id: string;
  customer: string;
  items: string;
  total: string;
  time: string;
  status: TabKey;
}

const ORDERS: OrderItem[] = [
  { id: '#1042', customer: 'Aysha S.', items: 'Burger x2, Fries x1', total: '৳580', time: '5 min ago', status: 'new' },
  { id: '#1041', customer: 'Karim H.', items: 'Biryani x1, Drink x2', total: '৳420', time: '12 min ago', status: 'new' },
  { id: '#1040', customer: 'Rina B.', items: 'Pizza x1', total: '৳350', time: '18 min ago', status: 'preparing' },
  { id: '#1039', customer: 'Rafi M.', items: 'Pasta x2, Salad x1', total: '৳620', time: '30 min ago', status: 'preparing' },
  { id: '#1038', customer: 'Sara K.', items: 'Sandwich x3', total: '৳390', time: '1h ago', status: 'completed' },
  { id: '#1037', customer: 'Noor J.', items: 'Sushi x2, Miso x1', total: '৳780', time: '2h ago', status: 'completed' },
];

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: Colors.primary },
  { key: 'preparing', label: 'Preparing', color: Colors.warning },
  { key: 'completed', label: 'Completed', color: Colors.success },
];

const SellerOrdersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabKey>('new');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = ORDERS.filter((o) => o.status === activeTab);
  const tabCfg = TABS.find((t) => t.key === activeTab)!;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Management</Text>
        <View style={styles.backBtn} />
      </View>

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
                {ORDERS.filter((o) => o.status === t.key).length}
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
              <Text style={styles.orderId}>{item.id}</Text>
              <Text style={styles.orderTime}>{item.time}</Text>
            </View>
            <Text style={styles.customer}>{item.customer}</Text>
            <Text style={styles.orderItems}>{item.items}</Text>
            <View style={styles.orderBottom}>
              <Text style={styles.orderTotal}>{item.total}</Text>
              {activeTab === 'new' && (
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: tabCfg.color }]}
                  onPress={() => setConfirmId(item.id)}
                >
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
              )}
              {activeTab === 'preparing' && (
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: Colors.warning }]}
                  onPress={() => setConfirmId(item.id)}
                >
                  <Text style={styles.acceptText}>Mark Ready</Text>
                </TouchableOpacity>
              )}
              {activeTab === 'completed' && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={[styles.acceptText, { color: Colors.success }]}>Done</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />

      <ConfirmModal
        visible={!!confirmId}
        title={activeTab === 'new' ? 'Accept Order' : 'Mark as Ready?'}
        message={`Order ${confirmId} will be ${activeTab === 'new' ? 'accepted and moved to Preparing' : 'marked as ready for pickup'}.`}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="success"
        onConfirm={() => setConfirmId(null)}
        onCancel={() => setConfirmId(null)}
      />
    </SafeAreaView>
  );
};

export default SellerOrdersScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomColor: 'transparent',
    borderBottomWidth: 2.5,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
  tabBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tabBadgeText: { fontSize: 11, fontWeight: '800' },
  list: { padding: 20, gap: 14 },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { fontSize: 15, fontWeight: '800', color: Colors.black },
  orderTime: { fontSize: 12, color: Colors.gray },
  customer: { fontSize: 14, fontWeight: '700', color: Colors.darkGray },
  orderItems: { fontSize: 13, color: Colors.gray },
  orderBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  orderTotal: { fontSize: 17, fontWeight: '900', color: Colors.sellerAccent },
  acceptBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  acceptText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.gray, fontWeight: '600' },
});
