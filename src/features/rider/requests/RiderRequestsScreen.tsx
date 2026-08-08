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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import type { RiderStackParamList } from '../../../navigation/RiderNavigator';

type NavProp = NativeStackNavigationProp<RiderStackParamList>;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DeliveryRequest {
  id: string;
  orderId: string;
  restaurant: string;
  restaurantAddress: string;
  customer: string;
  customerAddress: string;
  items: string;
  distance: string;
  eta: string;
  payout: string;
  receivedAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_REQUESTS: DeliveryRequest[] = [
  {
    id: 'req_001',
    orderId: '#1048',
    restaurant: 'Spice Garden',
    restaurantAddress: 'Road 12, Dhanmondi, Dhaka',
    customer: 'Aysha S.',
    customerAddress: 'House 5, Road 7, Mirpur-2, Dhaka',
    items: '2x Chicken Biryani, 1x Lassi',
    distance: '2.4 km',
    eta: '12 min',
    payout: '৳75',
    receivedAt: '2 min ago',
  },
  {
    id: 'req_002',
    orderId: '#1049',
    restaurant: 'Pizza Hub',
    restaurantAddress: 'Road 4, Gulshan-1, Dhaka',
    customer: 'Rafi M.',
    customerAddress: 'House 12, Road 3, Banani, Dhaka',
    items: '1x Pepperoni Pizza, 1x Garlic Bread',
    distance: '3.1 km',
    eta: '18 min',
    payout: '৳90',
    receivedAt: '5 min ago',
  },
  {
    id: 'req_003',
    orderId: '#1050',
    restaurant: 'Burger King BD',
    restaurantAddress: 'Jamuna Future Park, Bashundhara, Dhaka',
    customer: 'Noor J.',
    customerAddress: 'House 8, Road 15, Uttara Sector-7, Dhaka',
    items: '3x Whopper, 2x Fries, 3x Drinks',
    distance: '4.8 km',
    eta: '25 min',
    payout: '৳130',
    receivedAt: '8 min ago',
  },
];

// ─── Request Card component ───────────────────────────────────────────────────
interface RequestCardProps {
  item: DeliveryRequest;
  onAccept: (item: DeliveryRequest) => void;
  onDecline: (item: DeliveryRequest) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ item, onAccept, onDecline }) => (
  <View style={cardStyles.card}>
    {/* Top row */}
    <View style={cardStyles.topRow}>
      <View style={cardStyles.orderIdBadge}>
        <Text style={cardStyles.orderId}>{item.orderId}</Text>
      </View>
      <View style={cardStyles.rightBadges}>
        <View style={cardStyles.distanceBadge}>
          <Ionicons name="navigate-outline" size={12} color={Colors.riderAccent} />
          <Text style={cardStyles.distanceText}>{item.distance}</Text>
        </View>
        <View style={cardStyles.payoutBadge}>
          <Ionicons name="cash-outline" size={12} color={Colors.success} />
          <Text style={cardStyles.payoutText}>{item.payout}</Text>
        </View>
      </View>
    </View>

    {/* Route */}
    <View style={cardStyles.routeBox}>
      <View style={cardStyles.routeRow}>
        <View style={[cardStyles.routeDot, { backgroundColor: Colors.warning }]} />
        <View style={cardStyles.routeTextBlock}>
          <Text style={cardStyles.routeRole}>Pickup</Text>
          <Text style={cardStyles.routeMain}>{item.restaurant}</Text>
          <Text style={cardStyles.routeSub} numberOfLines={1}>{item.restaurantAddress}</Text>
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
          <Text style={cardStyles.routeMain}>{item.customer}</Text>
          <Text style={cardStyles.routeSub} numberOfLines={1}>{item.customerAddress}</Text>
        </View>
      </View>
    </View>

    {/* Items + ETA */}
    <View style={cardStyles.metaRow}>
      <View style={cardStyles.metaItem}>
        <Ionicons name="fast-food-outline" size={13} color={Colors.gray} />
        <Text style={cardStyles.metaText} numberOfLines={1}>{item.items}</Text>
      </View>
      <View style={cardStyles.metaItem}>
        <Ionicons name="time-outline" size={13} color={Colors.gray} />
        <Text style={cardStyles.metaText}>ETA {item.eta}</Text>
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

    <Text style={cardStyles.receivedAt}>Received {item.receivedAt}</Text>
  </View>
);

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
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: { fontSize: 11, fontWeight: '700', color: Colors.riderAccent },
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
  routeSub: { fontSize: 11, color: Colors.gray },
  routeConnector: { flexDirection: 'row', alignItems: 'center', marginLeft: 4, paddingVertical: 4, gap: 2 },
  connectorLine: { width: 1, height: 10, backgroundColor: Colors.border, marginLeft: 4 },
  metaRow: { gap: 6, marginBottom: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: Colors.gray, flex: 1 },
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
  const [requests, setRequests] = useState<DeliveryRequest[]>(MOCK_REQUESTS);
  const [pendingAccept, setPendingAccept] = useState<DeliveryRequest | null>(null);
  const [pendingDecline, setPendingDecline] = useState<DeliveryRequest | null>(null);

  const handleAcceptConfirm = () => {
    if (!pendingAccept) return;
    navigation.navigate('RiderAcceptedDelivery', { request: pendingAccept });
    setRequests((prev) => prev.filter((r) => r.id !== pendingAccept.id));
    setPendingAccept(null);
  };

  const handleDeclineConfirm = () => {
    if (!pendingDecline) return;
    setRequests((prev) => prev.filter((r) => r.id !== pendingDecline.id));
    setPendingDecline(null);
  };

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
            onPress={() => setRequests(MOCK_REQUESTS)}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.black} />
          </TouchableOpacity>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{requests.length}</Text>
          </View>
        </View>
      </View>

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
                {requests.length} pending request{requests.length > 1 ? 's' : ''} near you
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
        message={`You'll be assigned to Order ${pendingAccept?.orderId} from ${pendingAccept?.restaurant}.\n\nPayout: ${pendingAccept?.payout}  ·  Distance: ${pendingAccept?.distance}`}
        confirmText="Yes, Accept"
        cancelText="Cancel"
        variant="info"
        onConfirm={handleAcceptConfirm}
        onCancel={() => setPendingAccept(null)}
      />

      {/* Decline confirmation */}
      <ConfirmModal
        visible={!!pendingDecline}
        title="Decline Request?"
        message={`Are you sure you want to decline Order ${pendingDecline?.orderId}? This cannot be undone.`}
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
