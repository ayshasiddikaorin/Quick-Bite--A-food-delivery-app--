import React, { useState } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import { useApiData } from '../../../hooks/useApiData';
import { fetchRiderActiveOrders } from '../../../services/orderService';
import type { Order, OrderStatus } from '../../../models/order';
import type { RiderStackParamList } from '../../../navigation/RiderNavigator';

type NavProp = NativeStackNavigationProp<RiderStackParamList>;

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  assigned: 'Heading to Restaurant',
  on_the_way: 'On the Way',
  reached: 'Delivery Reached',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: Colors.warning,
  confirmed: Colors.success,
  preparing: Colors.info,
  ready: Colors.sellerAccent,
  assigned: Colors.warning,
  on_the_way: Colors.riderAccent,
  reached: Colors.primary,
  delivered: Colors.success,
  cancelled: Colors.error,
};

function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function orderLabel(order: Order): string {
  return `#${order.id.slice(-6).toUpperCase()}`;
}

const ActiveDeliveryCard: React.FC<{ item: Order; onOpen: (o: Order) => void }> = ({ item, onOpen }) => {
  const cfg = STATUS_COLOR[item.status];
  const itemsText = item.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');

  return (
    <TouchableOpacity style={styles.card} onPress={() => onOpen(item)} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={styles.orderIdBadge}>
          <Text style={styles.orderId}>{orderLabel(item)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg + '22' }]}>
          <Text style={[styles.statusText, { color: cfg }]}>{STATUS_LABEL[item.status]}</Text>
        </View>
      </View>

      <View style={styles.routeBox}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.routeMain}>{item.restaurantName}</Text>
        </View>
        <View style={styles.routeConnector}>
          <View style={styles.connectorLine} />
          <Ionicons name="arrow-down" size={12} color={Colors.gray} />
        </View>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: Colors.riderAccent }]} />
          <View style={styles.routeTextBlock}>
            <Text style={styles.routeMain}>{item.customerName}</Text>
            <Text style={styles.routeSub} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>
      </View>

      {itemsText ? (
        <View style={styles.metaRow}>
          <Ionicons name="fast-food-outline" size={13} color={Colors.gray} />
          <Text style={styles.metaText} numberOfLines={1}>{itemsText}</Text>
        </View>
      ) : null}

      <View style={styles.cardBottom}>
        <Text style={styles.receivedAt}>Updated {timeAgo(item.updatedAt)}</Text>
        <View style={styles.openBtn}>
          <Text style={styles.openBtnText}>Continue Delivery</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RiderActiveDeliveriesScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const { status, data, reload } = useApiData<Order[]>(fetchRiderActiveOrders, []);
  const active = status !== 'loading' ? data : [];

  useFocusEffect(
    React.useCallback(() => { reload(); }, [reload]),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Deliveries</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshBtn} onPress={reload} activeOpacity={0.8}>
            {status === 'loading'
              ? <ActivityIndicator size="small" color={Colors.riderAccent} />
              : <Ionicons name="refresh-outline" size={18} color={Colors.black} />}
          </TouchableOpacity>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{active.length}</Text>
          </View>
        </View>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Backend offline — live deliveries unavailable</Text>
        </View>
      )}

      {status === 'loading' && active.length === 0 ? (
        <LoadingScreen label="Loading active deliveries…" color={Colors.riderAccent} />
      ) : active.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bicycle-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No Active Deliveries</Text>
          <Text style={styles.emptySub}>
            Orders you accept will appear here with their live status.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('RiderRequests')}
            activeOpacity={0.85}
          >
            <Ionicons name="search-outline" size={16} color={Colors.white} />
            <Text style={styles.browseBtnText}>Browse Requests</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={active}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Ionicons name="radio-outline" size={14} color={Colors.riderAccent} />
              <Text style={styles.listHeaderText}>
                {active.length} ongoing deliver{active.length > 1 ? 'ies' : 'y'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ActiveDeliveryCard
              item={item}
              onOpen={(o) => navigation.navigate('RiderAcceptedDelivery', { order: o })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default RiderActiveDeliveriesScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 60,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  countBadge: {
    minWidth: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.riderAccent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  countText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '600', flex: 1 },
  list: { padding: 20, paddingBottom: 30 },
  listHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.infoLight, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, marginBottom: 16,
  },
  listHeaderText: { fontSize: 13, fontWeight: '600', color: Colors.riderAccent },
  card: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 16, marginBottom: 14,
    borderLeftWidth: 4, borderLeftColor: Colors.riderAccent,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  orderIdBadge: { backgroundColor: Colors.lightGray, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  orderId: { fontSize: 13, fontWeight: '800', color: Colors.black },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  routeBox: { marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeMain: { fontSize: 14, fontWeight: '700', color: Colors.black, flex: 1 },
  routeSub: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  routeTextBlock: { flex: 1 },
  routeConnector: { flexDirection: 'row', alignItems: 'center', marginLeft: 4, paddingVertical: 4, gap: 2 },
  connectorLine: { width: 1, height: 10, backgroundColor: Colors.border, marginLeft: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  metaText: { fontSize: 12, color: Colors.gray, flex: 1, lineHeight: 17 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  receivedAt: { fontSize: 11, color: Colors.gray },
  openBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.riderAccent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  openBtnText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: Colors.black },
  emptySub: { fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 22 },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8,
    backgroundColor: Colors.riderAccent, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14,
  },
  browseBtnText: { color: Colors.white, fontSize: 14, fontWeight: '800' },
});
