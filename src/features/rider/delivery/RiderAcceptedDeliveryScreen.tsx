import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import { useNotifications } from '../../../context/NotificationContext';
import { advanceOrderRider, fetchOrderById } from '../../../services/orderService';
import type { Order, OrderStatus } from '../../../models/order';
import type { RiderStackParamList } from '../../../navigation/RiderNavigator';

type NavProp = NativeStackNavigationProp<RiderStackParamList>;
type RouteProps = RouteProp<RiderStackParamList, 'RiderAcceptedDelivery'>;

type Stage = {
  status: OrderStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  nextLabel: string | null;
  hint: string | null;
  nextOrderStatus?: OrderStatus;
};

const STAGES: Stage[] = [
  {
    status: 'assigned',
    label: 'Heading to Restaurant',
    icon: 'navigate-outline',
    color: Colors.warning,
    nextLabel: null,
    hint: 'Waiting for the restaurant to confirm pickup…',
  },
  {
    status: 'on_the_way',
    label: 'On the Way to Customer',
    icon: 'bicycle-outline',
    color: Colors.riderAccent,
    nextLabel: 'Mark as Reached',
    hint: 'Order picked up — heading to the customer.',
    nextOrderStatus: 'reached',
  },
  {
    status: 'reached',
    label: 'Delivery Reached',
    icon: 'location-outline',
    color: Colors.primary,
    nextLabel: null,
    hint: 'You have reached the customer. Waiting for them to confirm receipt…',
  },
  {
    status: 'delivered',
    label: 'Delivered!',
    icon: 'checkmark-circle-outline',
    color: Colors.success,
    nextLabel: null,
    hint: 'Order delivered — payout credited to your earnings.',
  },
];

function stageFor(status: OrderStatus): Stage {
  const found = STAGES.find((s) => s.status === status);
  if (found) return found;
  if (status === 'cancelled') {
    return { status, label: 'Cancelled', icon: 'close-circle-outline', color: Colors.error, nextLabel: null, hint: 'This delivery was cancelled.' };
  }
  return { status, label: 'Active', icon: 'time-outline', color: Colors.warning, nextLabel: null, hint: 'Delivery in progress…' };
}

function orderLabel(order: Order): string {
  return `#${order.id.slice(-6).toUpperCase()}`;
}

function itemsText(order: Order): string {
  return order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ') || 'Items details unavailable';
}

const POLL_MS = 4000;

const RiderAcceptedDeliveryScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { order: initialOrder } = route.params;
  const { showPopup } = useNotifications();

  const [order, setOrder] = useState<Order>(initialOrder);
  const [showConfirm, setShowConfirm] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stage = stageFor(order.status);
  const payout = `৳${(order.deliveryFee ?? 0).toFixed(0)}`;
  const isTerminal = order.status === 'delivered' || order.status === 'cancelled';

  const refreshOrder = useCallback(async () => {
    if (isTerminal) return;
    try {
      const fresh = await fetchOrderById(order.id);
      setOrder(fresh);
    } catch {
      // keep last known state; network blips shouldn't kill the screen
    }
  }, [order.id, isTerminal]);

  useFocusEffect(
    React.useCallback(() => {
      refreshOrder();
      if (pollRef.current) clearInterval(pollRef.current);
      if (!isTerminal) {
        pollRef.current = setInterval(refreshOrder, POLL_MS);
      }
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }, [refreshOrder, isTerminal]),
  );

  useEffect(() => {
    if (order.status === 'delivered') {
      showPopup({
        title: '🎉 Delivery Complete!',
        message: `Order ${orderLabel(order)} delivered. Payout: ${payout}.`,
        variant: 'success',
        autoDismissMs: 5000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.status]);

  const handleStageAdvance = async () => {
    if (!stage.nextOrderStatus) return;
    setAdvancing(true);
    try {
      const fresh = await advanceOrderRider(order.id);
      setOrder(fresh);
      setShowConfirm(false);
    } catch (err: unknown) {
      showPopup({
        title: 'Update Failed',
        message: `${err instanceof Error ? err.message : 'Something went wrong'}. Please try again.`,
        variant: 'error',
      });
      setShowConfirm(false);
    } finally {
      setAdvancing(false);
    }
  };

  const completedIndex = STAGES.findIndex((s) => s.status === order.status);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Delivery</Text>
        <View style={[styles.stagePill, { backgroundColor: stage.color + '22' }]}>
          <Text style={[styles.stagePillText, { color: stage.color }]}>{stage.label}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: stage.color }]}>
          <View style={styles.statusBannerLeft}>
            <Ionicons name={stage.icon} size={28} color={Colors.white} />
            <View>
              <Text style={styles.statusBannerLabel}>Current Status</Text>
              <Text style={styles.statusBannerValue}>{stage.label}</Text>
            </View>
          </View>
          <View style={styles.payoutBox}>
            <Text style={styles.payoutLabel}>Your Payout</Text>
            <Text style={styles.payoutValue}>{payout}</Text>
          </View>
        </View>

        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapBg}>
            {[...Array(4)].map((_, i) => (
              <View key={`h${i}`} style={[styles.mapLineH, { top: `${25 * (i + 1)}%` as any }]} />
            ))}
            {[...Array(4)].map((_, i) => (
              <View key={`v${i}`} style={[styles.mapLineV, { left: `${25 * (i + 1)}%` as any }]} />
            ))}
          </View>
          <View style={[styles.riderPin, { borderColor: stage.color }]}>
            <Ionicons name="bicycle" size={18} color={stage.color} />
          </View>
          <View style={styles.mapTag}>
            <Ionicons name="map-outline" size={12} color={Colors.gray} />
            <Text style={styles.mapTagText}>Live Map</Text>
          </View>
        </View>

        {/* Order info card */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardHeader}>
            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdText}>{orderLabel(order)}</Text>
            </View>
            <View style={styles.totalBadge}>
              <Ionicons name="pricetag-outline" size={12} color={Colors.success} />
              <Text style={styles.totalText}>৳{order.total.toFixed(0)}</Text>
            </View>
          </View>

          {/* Route */}
          <View style={styles.routeRow}>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: Colors.warning }]} />
              <View>
                <Text style={styles.routeRole}>Pickup</Text>
                <Text style={styles.routeName}>{order.restaurantName}</Text>
              </View>
            </View>
          </View>
          <View style={styles.routeSeparator}>
            <View style={styles.routeLine} />
            <Ionicons name="arrow-down" size={12} color={Colors.gray} />
          </View>
          <View style={styles.routeRow}>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: Colors.riderAccent }]} />
              <View>
                <Text style={styles.routeRole}>Dropoff</Text>
                <Text style={styles.routeName}>{order.customerName}</Text>
                <Text style={styles.routeAddress} numberOfLines={2}>{order.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items summary */}
        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Order Items</Text>
          <Text style={styles.itemsList}>{itemsText(order)}</Text>
        </View>

        {/* Progress steps */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Delivery Progress</Text>
          {STAGES.map((step, index) => {
            const isDone = completedIndex >= 0 && index < completedIndex;
            const isActive = order.status === step.status;
            return (
              <View key={step.status} style={styles.progressRow}>
                <View style={[
                  styles.progressCircle,
                  isDone && { backgroundColor: Colors.success, borderColor: Colors.success },
                  isActive && { borderColor: step.color, borderWidth: 2.5 },
                ]}>
                  {isDone
                    ? <Ionicons name="checkmark" size={13} color={Colors.white} />
                    : <Ionicons name={step.icon} size={13} color={isActive ? step.color : Colors.gray} />
                  }
                </View>
                {index < STAGES.length - 1 && (
                  <View style={[styles.progressLine, isDone && { backgroundColor: Colors.success }]} />
                )}
                <Text style={[
                  styles.progressLabel,
                  isDone && { color: Colors.success },
                  isActive && { color: step.color, fontWeight: '800' },
                  !isDone && !isActive && { color: Colors.gray },
                ]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Status hint / waiting state */}
        {stage.hint && !isTerminal && (
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.gray} />
            <Text style={styles.hintText}>{stage.hint}</Text>
          </View>
        )}

        {/* Action button */}
        {!isTerminal ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: stage.color }]}
            onPress={() => setShowConfirm(true)}
            disabled={!stage.nextLabel || advancing}
            activeOpacity={stage.nextLabel ? 0.88 : 1}
          >
            {advancing
              ? <ActivityIndicator size="small" color={Colors.white} />
              : stage.nextLabel
                ? <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                : <Ionicons name="time-outline" size={20} color={Colors.white} />}
            <Text style={styles.actionBtnText}>
              {stage.nextLabel ?? 'Waiting…'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: stage.color }]}
            onPress={() => navigation.navigate('RiderDashboard')}
            activeOpacity={0.88}
          >
            <Ionicons name="home-outline" size={20} color={Colors.white} />
            <Text style={styles.actionBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ConfirmModal
        visible={showConfirm}
        title={stage.nextLabel ?? ''}
        message={`Confirm: ${stage.nextLabel} for Order ${orderLabel(order)}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="info"
        onConfirm={handleStageAdvance}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
};

export default RiderAcceptedDeliveryScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.black, flex: 1 },
  stagePill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  stagePillText: { fontSize: 11, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 18, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  statusBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusBannerLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  statusBannerValue: { color: Colors.white, fontSize: 16, fontWeight: '800', marginTop: 2 },
  payoutBox: { alignItems: 'flex-end' },
  payoutLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  payoutValue: { color: Colors.white, fontSize: 22, fontWeight: '900', marginTop: 2 },
  mapPlaceholder: {
    height: 160, borderRadius: 18, backgroundColor: '#E8F0E4',
    overflow: 'hidden', marginBottom: 14, position: 'relative',
  },
  mapBg: { ...StyleSheet.absoluteFillObject },
  mapLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  mapLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  riderPin: {
    position: 'absolute', top: '40%', left: '48%',
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
  },
  mapTag: {
    position: 'absolute', bottom: 8, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  mapTagText: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  orderCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  orderIdBadge: { backgroundColor: Colors.lightGray, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  orderIdText: { fontSize: 14, fontWeight: '800', color: Colors.black },
  totalBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.successLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  totalText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routeRole: { fontSize: 10, color: Colors.gray, textTransform: 'uppercase', fontWeight: '600' },
  routeName: { fontSize: 14, fontWeight: '700', color: Colors.black },
  routeAddress: { fontSize: 11, color: Colors.gray, marginTop: 2, lineHeight: 16 },
  routeSeparator: { flexDirection: 'row', alignItems: 'center', marginLeft: 4, paddingVertical: 4, gap: 2 },
  routeLine: { width: 1, height: 12, backgroundColor: Colors.border, marginLeft: 4 },
  itemsCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  itemsTitle: { fontSize: 13, fontWeight: '700', color: Colors.black, marginBottom: 6 },
  itemsList: { fontSize: 13, color: Colors.gray, lineHeight: 20 },
  progressCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  progressTitle: { fontSize: 14, fontWeight: '800', color: Colors.black, marginBottom: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  progressCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.lightGray, borderColor: Colors.border, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  progressLine: { position: 'absolute', left: 13, top: 28, width: 2, height: 20, backgroundColor: Colors.border },
  progressLabel: { fontSize: 13, fontWeight: '600' },
  hintBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 16,
  },
  hintText: { fontSize: 12, color: Colors.gray, flex: 1, lineHeight: 18 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 54, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  actionBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});
