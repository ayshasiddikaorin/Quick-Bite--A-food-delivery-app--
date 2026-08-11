import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import { useNotifications } from '../../../context/NotificationContext';
import { confirmOrderReceived, fetchOrderById } from '../../../services/orderService';
import type { BuyerStackParamList } from '../../../navigation/BuyerNavigator';
import type { OrderStatus } from '../../../models';

type NavProp = NativeStackNavigationProp<BuyerStackParamList>;
type RouteProps = RouteProp<BuyerStackParamList, 'OrderTracking'>;

// ─── Status steps ─────────────────────────────────────────────────────────────
type StepKey = 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'reached' | 'delivered';

interface Step {
  key: StepKey;
  label: string;
  sublabel: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const STEPS: Step[] = [
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    sublabel: 'Your order has been received',
    icon: 'checkmark-circle-outline',
  },
  {
    key: 'preparing',
    label: 'Preparing',
    sublabel: 'The kitchen is preparing your food',
    icon: 'restaurant-outline',
  },
  {
    key: 'ready',
    label: 'Ready for Pickup',
    sublabel: 'Order packed and ready',
    icon: 'bag-check-outline',
  },
  {
    key: 'on_the_way',
    label: 'On the Way',
    sublabel: 'Rider is heading to you',
    icon: 'bicycle-outline',
  },
  {
    key: 'reached',
    label: 'Rider Arrived',
    sublabel: 'Your rider is at your location',
    icon: 'location-outline',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    sublabel: 'Enjoy your meal! 🎉',
    icon: 'home-outline',
  },
];

const STEP_KEYS: StepKey[] = ['confirmed', 'preparing', 'ready', 'on_the_way', 'reached', 'delivered'];

// Backend status → timeline step index
function statusToIndex(status?: OrderStatus): number {
  switch (status) {
    case 'pending':
    case 'confirmed': return 0;
    case 'preparing': return 1;
    case 'ready': return 2;
    case 'assigned':
    case 'on_the_way': return 3;
    case 'reached': return 4;
    case 'delivered': return 5;
    case 'cancelled': return 0;
    default: return 1;
  }
}

const ETA_LABELS: Record<string, string> = {
  confirmed: '~35 min',
  preparing: '~28 min',
  ready: '~18 min',
  on_the_way: '~8 min',
  reached: 'Now',
  delivered: 'Delivered!',
};

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();

  const { orderId, paymentMethod, total, address, deliveryType, isDummy } = route.params;

  const [currentStepIndex, setCurrentStepIndex] = useState(1); // start at "Preparing"
  const [riderName, setRiderName] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { showPopup } = useNotifications();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Live polling: refresh the real order status every few seconds.
  useEffect(() => {
    if (isDummy) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const order = await fetchOrderById(orderId);
        if (cancelled) return;
        setCurrentStepIndex(statusToIndex(order.status));
        if (order.riderName) setRiderName(order.riderName);
      } catch { /* backend offline — keep last known */ }
    };
    poll();
    const interval = setInterval(poll, 6000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [orderId, isDummy]);

  // Pulse animation for active step
  useEffect(() => {
    if (isDummy) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim, isDummy]);

  // Demo auto-advance (only in dummy data mode)
  useEffect(() => {
    if (!isDummy) return;
    if (currentStepIndex >= STEP_KEYS.length - 1) return;
    const timer = setTimeout(() => setCurrentStepIndex((i) => i + 1), 4000);
    return () => clearTimeout(timer);
  }, [currentStepIndex, isDummy]);

  const currentStep = currentStepIndex >= 0 ? STEPS[currentStepIndex] : STEPS[0];
  const isDelivered = currentStepIndex === STEP_KEYS.length - 1;
  const reachedStepIndex = STEP_KEYS.indexOf('reached');
  const isReached = currentStepIndex === reachedStepIndex;

  const handleConfirmReceived = async () => {
    if (isDummy) return;
    setConfirming(true);
    try {
      await confirmOrderReceived(orderId);
      const fresh = await fetchOrderById(orderId);
      setCurrentStepIndex(statusToIndex(fresh.status));
      setShowConfirm(false);
      showPopup({
        title: 'Order Received! 🎉',
        message: 'Thank you! Enjoy your meal.',
        variant: 'success',
        autoDismissMs: 4000,
      });
    } catch (err: unknown) {
      showPopup({
        title: 'Update Failed',
        message: `${err instanceof Error ? err.message : 'Something went wrong'}. Please try again.`,
        variant: 'error',
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('BuyerTabs')}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <TouchableOpacity style={styles.helpBtn} activeOpacity={0.75}>
          <Ionicons name="help-circle-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isDummy && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Dummy data mode · backend offline — simulated order</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Order ID + ETA ────────────────────────────────────────────── */}
        <View style={[styles.etaCard, isDelivered && styles.etaCardDelivered]}>
          <View style={styles.etaLeft}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderId}>{orderId}</Text>
            <View style={styles.paymentRow}>
              <Ionicons name="card-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.paymentLabel}>{paymentMethod}</Text>
            </View>
          </View>
          <View style={styles.etaRight}>
            <Text style={styles.etaLabel}>ETA</Text>
            <Text style={styles.etaValue}>{ETA_LABELS[currentStep.key]}</Text>
            <Text style={styles.etaTotal}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* ── Map placeholder ──────────────────────────────────────────── */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapBg}>
            {/* Grid lines to simulate map */}
            {[...Array(5)].map((_, i) => (
              <View
                key={`h${i}`}
                style={[styles.mapLineH, { top: `${20 * (i + 1)}%` as any }]}
              />
            ))}
            {[...Array(5)].map((_, i) => (
              <View
                key={`v${i}`}
                style={[styles.mapLineV, { left: `${20 * (i + 1)}%` as any }]}
              />
            ))}
          </View>

          {/* Rider pin */}
          <Animated.View style={[styles.riderPin, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.riderPinInner}>
              <Ionicons name="bicycle" size={18} color={Colors.white} />
            </View>
            <View style={styles.pinTail} />
          </Animated.View>

          {/* Destination pin */}
          <View style={styles.destPin}>
            <Ionicons name="home" size={16} color={Colors.white} />
          </View>

          {/* Map overlay label */}
          <View style={styles.mapLabel}>
            <Ionicons name="map-outline" size={14} color={Colors.gray} />
            <Text style={styles.mapLabelText}>Live Map</Text>
          </View>
        </View>

        {/* ── Rider info ───────────────────────────────────────────────── */}
        {!isDelivered && (
          <View style={styles.riderCard}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>KH</Text>
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>{riderName ?? 'Karim Hossain'}</Text>
              <View style={styles.riderMeta}>
                <Ionicons name="star" size={12} color={Colors.warning} />
                <Text style={styles.riderRating}>4.9</Text>
                <Text style={styles.riderVehicle}>· Motorcycle</Text>
              </View>
            </View>
            <View style={styles.riderActions}>
              <TouchableOpacity style={styles.riderActionBtn}>
                <Ionicons name="call-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.riderActionBtn}>
                <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Status timeline ──────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Order Status</Text>
        <View style={styles.timelineCard}>
          {STEPS.map((step, index) => {
            const isDone = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            const isLast = index === STEPS.length - 1;

            return (
              <View key={step.key} style={styles.timelineRow}>
                {/* Line */}
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.stepCircle,
                      isDone && styles.stepCircleDone,
                      isActive && styles.stepCircleActive,
                      isPending && styles.stepCirclePending,
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={14} color={Colors.white} />
                    ) : (
                      <Ionicons
                        name={step.icon}
                        size={14}
                        color={isActive ? Colors.white : Colors.gray}
                      />
                    )}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.stepLine,
                        (isDone || isActive) && styles.stepLineDone,
                      ]}
                    />
                  )}
                </View>

                {/* Content */}
                <View
                  style={[
                    styles.timelineContent,
                    !isLast && { paddingBottom: 20 },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepLabel,
                      isDone && { color: Colors.success },
                      isActive && { color: Colors.primary },
                      isPending && { color: Colors.gray },
                    ]}
                  >
                    {step.label}
                  </Text>
                  <Text style={styles.stepSublabel}>{step.sublabel}</Text>
                  {isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>In Progress</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Confirm received (when rider has arrived) ─────────────────── */}
        {isReached && !isDummy && (
          <TouchableOpacity
            style={styles.confirmReceivedBtn}
            onPress={() => setShowConfirm(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-done-outline" size={20} color={Colors.white} />
            <Text style={styles.confirmReceivedText}>Confirm Received</Text>
          </TouchableOpacity>
        )}

        {/* ── Delivery address ─────────────────────────────────────────── */}
        <View style={styles.addressCard}>
          <Ionicons name="location" size={18} color={Colors.primary} />
          <View style={styles.addressText}>
            <Text style={styles.addressTitle}>Delivering to</Text>
            <Text style={styles.addressValue}>{address}</Text>
          </View>
        </View>

        {/* ── Rate / Review (after delivery) ───────────────────────────── */}
        {isDelivered && (
          <TouchableOpacity style={styles.reviewBtn} activeOpacity={0.85}>
            <Ionicons name="star-outline" size={20} color={Colors.white} />
            <Text style={styles.reviewBtnText}>Rate Your Order</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ConfirmModal
        visible={showConfirm}
        title="Confirm Received"
        message="Have you received your order? The delivery will be marked as complete."
        confirmText={confirming ? 'Confirming…' : 'Yes, Received'}
        cancelText="Not Yet"
        variant="success"
        onConfirm={handleConfirmReceived}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
};

export default OrderTrackingScreen;

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
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  scroll: { padding: 20, paddingBottom: 40 },

  // Dummy-data banner
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '700', flex: 1 },

  // ETA card
  etaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  etaCardDelivered: { backgroundColor: Colors.success },
  etaLeft: { gap: 4 },
  orderIdLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  orderId: { color: Colors.white, fontSize: 22, fontWeight: '900' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paymentLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '500' },
  etaRight: { alignItems: 'flex-end', gap: 4 },
  etaLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  etaValue: { color: Colors.white, fontSize: 22, fontWeight: '900' },
  etaTotal: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700' },

  // Map placeholder
  mapPlaceholder: {
    height: 180,
    borderRadius: 20,
    backgroundColor: '#E8F0E4',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  mapLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  riderPin: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    alignItems: 'center',
  },
  riderPinInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
  },
  destPin: {
    position: 'absolute',
    top: '20%',
    right: '25%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  mapLabel: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  mapLabelText: { fontSize: 11, color: Colors.gray, fontWeight: '600' },

  // Rider card
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  riderAvatarText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  riderInfo: { flex: 1, gap: 4 },
  riderName: { fontSize: 15, fontWeight: '700', color: Colors.black },
  riderMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  riderRating: { fontSize: 12, fontWeight: '700', color: Colors.black },
  riderVehicle: { fontSize: 12, color: Colors.gray },
  riderActions: { flexDirection: 'row', gap: 8 },
  riderActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Timeline
  timelineCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 28 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightGray,
  },
  stepCircleDone: { backgroundColor: Colors.success },
  stepCircleActive: { backgroundColor: Colors.primary },
  stepCirclePending: { backgroundColor: Colors.lightGray },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 2,
    minHeight: 20,
  },
  stepLineDone: { backgroundColor: Colors.success },
  timelineContent: { flex: 1, paddingTop: 4 },
  stepLabel: { fontSize: 14, fontWeight: '700', color: Colors.black, marginBottom: 2 },
  stepSublabel: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 5,
  },
  activeBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },

  // Address card
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  addressText: { flex: 1, gap: 2 },
  addressTitle: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
  addressValue: { fontSize: 14, fontWeight: '600', color: Colors.black, lineHeight: 20 },

  // Review button
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.warning,
    borderRadius: 18,
    height: 52,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  reviewBtnText: { color: Colors.white, fontSize: 15, fontWeight: '800' },

  // Confirm received button
  confirmReceivedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    borderRadius: 18,
    height: 52,
    marginBottom: 16,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmReceivedText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
});
