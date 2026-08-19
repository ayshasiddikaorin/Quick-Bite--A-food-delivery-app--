import React, { useState, useEffect, useCallback } from 'react';
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
import ConfirmModal from '../../../components/shared/ConfirmModal';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import { useApiData } from '../../../hooks/useApiData';
import { useNotifications } from '../../../context/NotificationContext';
import { fetchRiderAvailableOrders, acceptDelivery } from '../../../services/orderService';
import type { Order } from '../../../models/order';
import type { RiderStackParamList } from '../../../navigation/RiderNavigator';
import { formatBDT } from '../../../utils/currency';

type NavProp = NativeStackNavigationProp<RiderStackParamList>;

const EMPTY_ORDERS: Order[] = [];

function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/** Format the delivery payout shown to the rider (deliveryFee is the rider's share). */
function payoutFor(order: Order): string {
  return formatBDT(order.deliveryFee ?? 0);
}

function orderLabel(order: Order): string {
  return `#${order.id.slice(-6).toUpperCase()}`;
}

// ─── Request Card component ───────────────────────────────────────────────────
interface RequestCardProps {
  item: Order;
  onAccept: (item: Order) => void;
  onDecline: (item: Order) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ item, onAccept, onDecline }) => {
  const itemsText = item.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');

  return (
    <View style={cardStyles.card}>
      {/* Top row */}
      <View style={cardStyles.topRow}>
        <View style={cardStyles.orderIdBadge}>
          <Text style={cardStyles.orderId}>{orderLabel(item)}</Text>
        </View>
        <View style={cardStyles.rightBadges}>
          <View style={cardStyles.payoutBadge}>
            <Ionicons name="cash-outline" size={12} color={Colors.success} />
            <Text style={cardStyles.payoutText}>{payoutFor(item)}</Text>
          </View>
        </View>
      </View>

      {/* Route */}
      <View style={cardStyles.routeBox}>
        <View style={cardStyles.routeRow}>
          <View style={[cardStyles.routeDot, { backgroundColor: Colors.warning }]} />
          <View style={cardStyles.routeTextBlock}>
            <Text style={cardStyles.routeRole}>Pickup</Text>
            <Text style={cardStyles.routeMain}>{item.restaurantName}</Text>
          </View>
        </View>

        <View style={cardStyles.routeConnector}>
          <View style={cardStyles.connectorLine} />
          <Ionicons name="arrow-down" size={12} color={Colors.gray} />
        </View>

        <View style={cardStyles.routeRow}>
          <View style={[cardStyles.routeDot, { backgroundColor: Colors.riderAccent }]} />
          <View style={cardStyles.routeTextBlock}>
            <Text style={cardStyles.routeRole}>Dropoff</Text>
            <Text style={cardStyles.routeMain}>{item.customerName}</Text>
            <Text style={cardStyles.routeSub} numberOfLines={2}>{item.address}</Text>
          </View>
        </View>
      </View>

      {/* Items */}
      <View style={cardStyles.metaRow}>
        <View style={cardStyles.metaItem}>
          <Ionicons name="fast-food-outline" size={13} color={Colors.gray} />
          <Text style={cardStyles.metaText} numberOfLines={2}>{itemsText}</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={cardStyles.btnRow}>
        <TouchableOpacity
          style={cardStyles.declineBtn}
          onPress={() => onDecline(item)}
          activeOpacity={0.85}
        >
          <Ionicons name="close" size={16} color={Colors.error} />
          <Text style={cardStyles.declineBtnText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={cardStyles.acceptBtn}
          onPress={() => onAccept(item)}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark" size={16} color={Colors.white} />
          <Text style={cardStyles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
      </View>

      <Text style={cardStyles.receivedAt}>Received {timeAgo(item.createdAt)}</Text>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.riderAccent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  orderIdBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderId: { fontSize: 13, fontWeight: '800', color: Colors.black },
  rightBadges: { flexDirection: 'row', gap: 8 },
  payoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  payoutText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  routeBox: { marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routeTextBlock: { flex: 1, gap: 1 },
  routeRole: { fontSize: 10, color: Colors.gray, fontWeight: '600', textTransform: 'uppercase' },
  routeMain: { fontSize: 14, fontWeight: '700', color: Colors.black },
  routeSub: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  routeConnector: { flexDirection: 'row', alignItems: 'center', marginLeft: 4, paddingVertical: 4, gap: 2 },
  connectorLine: { width: 1, height: 10, backgroundColor: Colors.border, marginLeft: 4 },
  metaRow: { gap: 6, marginBottom: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: Colors.gray, flex: 1, lineHeight: 17 },
  btnRow: { flexDirection: 'row', gap: 10 },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  declineBtnText: { fontSize: 14, fontWeight: '700', color: Colors.error },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.riderAccent,
    shadowColor: Colors.riderAccent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtnText: { fontSize: 14, fontWeight: '800', color: Colors.white },
  receivedAt: { fontSize: 11, color: Colors.gray, marginTop: 10, textAlign: 'right' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
const RiderRequestsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { showPopup } = useNotifications();

  const { status, data, reload } = useApiData<Order[]>(fetchRiderAvailableOrders, EMPTY_ORDERS);
  const [requests, setRequests] = useState<Order[]>(EMPTY_ORDERS);
  const [pendingAccept, setPendingAccept] = useState<Order | null>(null);
  const [pendingDecline, setPendingDecline] = useState<Order | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (status !== 'loading') setRequests(data);
  }, [status, data]);

  useFocusEffect(
    useCallback(() => { reload(); }, [reload]),
  );

  // Poll for new delivery jobs while the screen is mounted.
  useEffect(() => {
    const interval = setInterval(() => { reload(); }, 8000);
    return () => clearInterval(interval);
  }, [reload]);

  const handleAcceptConfirm = async () => {
    if (!pendingAccept) return;
    setAccepting(true);
    try {
      const order = await acceptDelivery(pendingAccept.id);
      setRequests((prev) => prev.filter((r) => r.id !== pendingAccept.id));
      setPendingAccept(null);
      navigation.navigate('RiderAcceptedDelivery', { order });
    } catch (err: unknown) {
      setPendingAccept(null);
      showPopup({
        title: 'Accept Failed',
        message: `${err instanceof Error ? err.message : 'Something went wrong'}. The job may have been taken by another rider.`,
        variant: 'error',
      });
      reload();
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineConfirm = () => {
    if (!pendingDecline) return;
    setRequests((prev) => prev.filter((r) => r.id !== pendingDecline.id));
    setPendingDecline(null);
  };

  const liveCount = requests.length;

  if (status === 'loading' && requests.length === 0) {
    return <LoadingScreen label="Loading delivery requests…" color={Colors.riderAccent} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Requests</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={reload}
            activeOpacity={0.8}
          >
            {status === 'loading'
              ? <ActivityIndicator size="small" color={Colors.riderAccent} />
              : <Ionicons name="refresh-outline" size={18} color={Colors.black} />}
          </TouchableOpacity>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{liveCount}</Text>
          </View>
        </View>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Backend offline — no live delivery jobs</Text>
        </View>
      )}

      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No Requests</Text>
          <Text style={styles.emptySub}>
            New delivery requests will appear here. Make sure you're online.
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Ionicons name="radio-outline" size={14} color={Colors.riderAccent} />
              <Text style={styles.listHeaderText}>
                {requests.length} pending request{requests.length > 1 ? 's' : ''} ready for pickup
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              onAccept={(r) => setPendingAccept(r)}
              onDecline={(r) => setPendingDecline(r)}
            />
          )}
        />
      )}

      {/* Accept confirmation */}
      <ConfirmModal
        visible={!!pendingAccept}
        title="Accept Request?"
        message={`You'll be assigned to Order ${pendingAccept ? orderLabel(pendingAccept) : ''} from ${pendingAccept?.restaurantName}.\n\nPayout: ${pendingAccept ? payoutFor(pendingAccept) : ''}`}
        confirmText={accepting ? 'Accepting…' : 'Yes, Accept'}
        cancelText="Cancel"
        variant="info"
        onConfirm={handleAcceptConfirm}
        onCancel={() => setPendingAccept(null)}
      />

      {/* Decline confirmation */}
      <ConfirmModal
        visible={!!pendingDecline}
        title="Decline Request?"
        message={`Are you sure you want to decline this delivery request?`}
        confirmText="Yes, Decline"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeclineConfirm}
        onCancel={() => setPendingDecline(null)}
      />
    </SafeAreaView>
  );
};

export default RiderRequestsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: Colors.white,
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.riderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  listHeaderText: { fontSize: 13, fontWeight: '600', color: Colors.riderAccent },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 14,
  },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: Colors.black },
  emptySub: { fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 22 },
});