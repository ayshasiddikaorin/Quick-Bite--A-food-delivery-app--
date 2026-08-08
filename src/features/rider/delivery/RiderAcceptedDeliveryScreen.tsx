import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import type { RiderStackParamList } from '../../../navigation/RiderNavigator';

type NavProp = NativeStackNavigationProp<RiderStackParamList>;
type RouteProps = RouteProp<RiderStackParamList, 'RiderAcceptedDelivery'>;

type Stage = 'heading_to_restaurant' | 'picked_up' | 'heading_to_customer' | 'delivered';

const STAGE_CONFIG: Record<Stage, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; next: Stage | null; nextLabel: string | null }> = {
  heading_to_restaurant: {
    label: 'Heading to Restaurant',
    icon: 'restaurant-outline',
    color: Colors.warning,
    next: 'picked_up',
    nextLabel: 'Mark as Picked Up',
  },
  picked_up: {
    label: 'Order Picked Up',
    icon: 'bag-check-outline',
    color: Colors.riderAccent,
    next: 'heading_to_customer',
    nextLabel: 'Start Delivery',
  },
  heading_to_customer: {
    label: 'Heading to Customer',
    icon: 'bicycle-outline',
    color: Colors.primary,
    next: 'delivered',
    nextLabel: 'Mark as Delivered',
  },
  delivered: {
    label: 'Delivered!',
    icon: 'checkmark-circle-outline',
    color: Colors.success,
    next: null,
    nextLabel: null,
  },
};

const RiderAcceptedDeliveryScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { request } = route.params;

  const [stage, setStage] = useState<Stage>('heading_to_restaurant');
  const [showConfirm, setShowConfirm] = useState(false);

  const cfg = STAGE_CONFIG[stage];

  const handleStageAdvance = () => {
    if (cfg.next) {
      setStage(cfg.next);
      setShowConfirm(false);
    } else {
      // Already delivered — go back to dashboard
      Alert.alert('Great job!', `Order ${request.orderId} has been delivered. Payout: ${request.payout}`, [
        { text: 'Back to Dashboard', onPress: () => navigation.navigate('RiderDashboard') },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Delivery</Text>
        <View style={[styles.stagePill, { backgroundColor: cfg.color + '22' }]}>
          <Text style={[styles.stagePillText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: cfg.color }]}>
          <View style={styles.statusBannerLeft}>
            <Ionicons name={cfg.icon} size={28} color={Colors.white} />
            <View>
              <Text style={styles.statusBannerLabel}>Current Status</Text>
              <Text style={styles.statusBannerValue}>{cfg.label}</Text>
            </View>
          </View>
          <View style={styles.payoutBox}>
            <Text style={styles.payoutLabel}>Your Payout</Text>
            <Text style={styles.payoutValue}>{request.payout}</Text>
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
          <View style={[styles.riderPin, { borderColor: cfg.color }]}>
            <Ionicons name="bicycle" size={18} color={cfg.color} />
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
              <Text style={styles.orderIdText}>{request.orderId}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-outline" size={12} color={Colors.riderAccent} />
              <Text style={styles.distanceText}>{request.distance}</Text>
            </View>
          </View>

          {/* Route */}
          <View style={styles.routeRow}>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: Colors.warning }]} />
              <View>
                <Text style={styles.routeRole}>Pickup</Text>
                <Text style={styles.routeName}>{request.restaurant}</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>{request.restaurantAddress}</Text>
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
                <Text style={styles.routeName}>{request.customer}</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>{request.customerAddress}</Text>
              </View>
            </View>
          </View>

          <View style={styles.etaRow}>
            <Ionicons name="time-outline" size={14} color={Colors.gray} />
            <Text style={styles.etaText}>ETA: <Text style={styles.etaValue}>{request.eta}</Text></Text>
          </View>
        </View>

        {/* Items summary */}
        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Order Items</Text>
          <Text style={styles.itemsList}>{request.items}</Text>
        </View>

        {/* Progress steps */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Delivery Progress</Text>
          {(Object.keys(STAGE_CONFIG) as Stage[]).map((key, index) => {
            const stepCfg = STAGE_CONFIG[key];
            const isDone = Object.keys(STAGE_CONFIG).indexOf(stage) > index;
            const isActive = stage === key;
            return (
              <View key={key} style={styles.progressRow}>
                <View style={[
                  styles.progressCircle,
                  isDone && { backgroundColor: Colors.success, borderColor: Colors.success },
                  isActive && { borderColor: cfg.color, borderWidth: 2.5 },
                ]}>
                  {isDone
                    ? <Ionicons name="checkmark" size={13} color={Colors.white} />
                    : <Ionicons name={stepCfg.icon} size={13} color={isActive ? cfg.color : Colors.gray} />
                  }
                </View>
                {index < 3 && (
                  <View style={[styles.progressLine, isDone && { backgroundColor: Colors.success }]} />
                )}
                <Text style={[
                  styles.progressLabel,
                  isDone && { color: Colors.success },
                  isActive && { color: cfg.color, fontWeight: '800' },
                  !isDone && !isActive && { color: Colors.gray },
                ]}>
                  {stepCfg.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Action button */}
        {cfg.next !== null && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: cfg.color }]}
            onPress={() => setShowConfirm(true)}
            activeOpacity={0.88}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.actionBtnText}>{cfg.nextLabel}</Text>
          </TouchableOpacity>
        )}
        {stage === 'delivered' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
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
        title={cfg.nextLabel ?? ''}
        message={`Confirm: ${cfg.nextLabel} for Order ${request.orderId}?`}
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
  mapBg: { ...StyleSheet.absoluteFill },
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
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.infoLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  distanceText: { fontSize: 11, fontWeight: '700', color: Colors.riderAccent },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routeRole: { fontSize: 10, color: Colors.gray, textTransform: 'uppercase', fontWeight: '600' },
  routeName: { fontSize: 14, fontWeight: '700', color: Colors.black },
  routeAddress: { fontSize: 11, color: Colors.gray },
  routeSeparator: { flexDirection: 'row', alignItems: 'center', marginLeft: 4, paddingVertical: 4, gap: 2 },
  routeLine: { width: 1, height: 12, backgroundColor: Colors.border, marginLeft: 4 },
  etaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.lightGray, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6, marginTop: 12,
  },
  etaText: { fontSize: 12, color: Colors.gray },
  etaValue: { fontWeight: '700', color: Colors.riderAccent },
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
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 54, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  actionBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});
