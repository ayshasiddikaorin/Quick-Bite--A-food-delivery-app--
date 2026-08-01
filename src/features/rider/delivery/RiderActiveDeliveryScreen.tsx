import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';

const RiderActiveDeliveryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showAccept, setShowAccept] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);

  if (declined) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Delivery</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="close-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.emptyTitle}>Delivery Declined</Text>
          <Text style={styles.emptySubText}>You declined this delivery request.</Text>
          <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (accepted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Delivery</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="checkmark-circle-outline" size={64} color={Colors.success} />
          <Text style={styles.emptyTitle}>Delivery Accepted!</Text>
          <Text style={styles.emptySubText}>Head to Spice Garden to pick up Order #1042.</Text>
          <TouchableOpacity style={[styles.goBackBtn, { backgroundColor: Colors.riderAccent }]} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.goBackText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Delivery</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location" size={48} color={Colors.gray} />
          <Text style={styles.mapText}>Map View</Text>
          <Text style={styles.mapSubText}>Live map would appear here</Text>
        </View>

        {/* Order Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardHeader}>
            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdText}>Order #1042</Text>
            </View>
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-outline" size={13} color={Colors.riderAccent} />
              <Text style={styles.distanceText}>2.4 km away</Text>
            </View>
          </View>

          {/* Route: Restaurant → Customer */}
          <View style={styles.routeRow}>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: Colors.warning }]} />
              <View>
                <Text style={styles.routeRole}>Restaurant</Text>
                <Text style={styles.routeName}>Spice Garden</Text>
              </View>
            </View>
            <View style={styles.routeArrow}>
              <Ionicons name="arrow-forward" size={18} color={Colors.gray} />
            </View>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
              <View>
                <Text style={styles.routeRole}>Customer</Text>
                <Text style={styles.routeName}>Aysha S.</Text>
              </View>
            </View>
          </View>

          {/* ETA */}
          <View style={styles.etaRow}>
            <Ionicons name="time-outline" size={16} color={Colors.gray} />
            <Text style={styles.etaText}>Estimated delivery time: <Text style={styles.etaValue}>12 min</Text></Text>
          </View>
        </View>

        {/* Pickup Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <View style={[styles.addressIconBox, { backgroundColor: '#FFF8E1' }]}>
              <Ionicons name="restaurant-outline" size={20} color={Colors.warning} />
            </View>
            <View style={styles.addressDetails}>
              <Text style={styles.addressLabel}>Pickup from</Text>
              <Text style={styles.addressText}>Spice Garden, Road 12, Dhanmondi, Dhaka</Text>
            </View>
          </View>

          <View style={styles.addressDivider} />

          <View style={styles.addressRow}>
            <View style={[styles.addressIconBox, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="location-outline" size={20} color={Colors.riderAccent} />
            </View>
            <View style={styles.addressDetails}>
              <Text style={styles.addressLabel}>Deliver to</Text>
              <Text style={styles.addressText}>House 5, Road 7, Mirpur-2, Dhaka 1216</Text>
            </View>
          </View>
        </View>

        {/* Order Items Summary */}
        <View style={styles.itemsSummaryCard}>
          <Text style={styles.itemsSummaryTitle}>Order Summary</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>2x Chicken Biryani</Text>
            <Text style={styles.itemPrice}>৳320</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>1x Mango Lassi</Text>
            <Text style={styles.itemPrice}>৳80</Text>
          </View>
          <View style={styles.itemsTotalRow}>
            <Text style={styles.itemsTotalLabel}>Total Payout</Text>
            <Text style={styles.itemsTotalValue}>৳75</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => setShowDecline(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={18} color={Colors.error} />
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => setShowAccept(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={18} color={Colors.white} />
            <Text style={styles.acceptBtnText}>Accept Delivery</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Accept Confirm Modal */}
      <ConfirmModal
        visible={showAccept}
        title="Accept Delivery"
        message="Are you sure you want to accept this delivery? You'll be assigned to Order #1042."
        confirmText="Yes, Accept"
        cancelText="Cancel"
        variant="info"
        onConfirm={() => { setShowAccept(false); setAccepted(true); }}
        onCancel={() => setShowAccept(false)}
      />

      {/* Decline Confirm Modal */}
      <ConfirmModal
        visible={showDecline}
        title="Decline Delivery"
        message="Are you sure you want to decline this delivery request?"
        confirmText="Yes, Decline"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => { setShowDecline(false); setDeclined(true); }}
        onCancel={() => setShowDecline(false)}
      />
    </SafeAreaView>
  );
};

export default RiderActiveDeliveryScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.black },
  scroll: { padding: 16, paddingBottom: 40 },

  // Map placeholder
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  mapText: { fontSize: 18, fontWeight: '700', color: Colors.gray },
  mapSubText: { fontSize: 13, color: Colors.gray },

  // Order card
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderIdBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  orderIdText: { fontSize: 14, fontWeight: '800', color: Colors.black },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  distanceText: { fontSize: 12, fontWeight: '600', color: Colors.riderAccent },

  // Route
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeRole: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  routeName: { fontSize: 14, fontWeight: '800', color: Colors.black },
  routeArrow: { paddingHorizontal: 8 },

  // ETA
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  etaText: { fontSize: 13, color: Colors.gray, fontWeight: '500' },
  etaValue: { fontWeight: '700', color: Colors.riderAccent },

  // Address card
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  addressIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressDetails: { flex: 1 },
  addressLabel: { fontSize: 11, color: Colors.gray, fontWeight: '600', marginBottom: 3 },
  addressText: { fontSize: 14, fontWeight: '600', color: Colors.black, lineHeight: 20 },
  addressDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
    marginLeft: 58,
  },

  // Items summary
  itemsSummaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  itemsSummaryTitle: { fontSize: 15, fontWeight: '800', color: Colors.black, marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 13, color: Colors.darkGray, fontWeight: '500' },
  itemPrice: { fontSize: 13, color: Colors.black, fontWeight: '600' },
  itemsTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  itemsTotalLabel: { fontSize: 14, fontWeight: '700', color: Colors.black },
  itemsTotalValue: { fontSize: 16, fontWeight: '900', color: Colors.riderAccent },

  // Buttons
  buttonsRow: { flexDirection: 'row', gap: 12 },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  declineBtnText: { fontSize: 15, fontWeight: '700', color: Colors.error },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.riderAccent,
    shadowColor: Colors.riderAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  acceptBtnText: { fontSize: 15, fontWeight: '800', color: Colors.white },

  // States
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 14 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: Colors.black },
  emptySubText: { fontSize: 14, color: Colors.gray, textAlign: 'center' },
  goBackBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  goBackText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
