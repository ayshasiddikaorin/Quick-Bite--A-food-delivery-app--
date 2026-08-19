import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import FormModal from '../../../components/shared/FormModal';
import InputField from '../../../components/shared/InputField';
import PrimaryButton from '../../../components/shared/PrimaryButton';
import type { BuyerStackParamList } from '../../../navigation/BuyerNavigator';
import { formatBDT } from '../../../utils/currency';

type NavProp = NativeStackNavigationProp<BuyerStackParamList>;
type RouteProps = RouteProp<BuyerStackParamList, 'Checkout'>;

type DeliveryType = 'standard' | 'express';

const DELIVERY_OPTIONS: {
  key: DeliveryType;
  label: string;
  subtitle: string;
  fee: number;
  icon: keyof typeof Ionicons.glyphMap;
  eta: string;
}[] = [
  {
    key: 'standard',
    label: 'Standard Delivery',
    subtitle: 'Delivered within the estimated time',
    fee: 60,
    icon: 'bicycle-outline',
    eta: '30–45 min',
  },
  {
    key: 'express',
    label: 'Express Delivery',
    subtitle: 'Priority handling, faster dispatch',
    fee: 120,
    icon: 'flash-outline',
    eta: '15–20 min',
  },
];

// ─── Row component ────────────────────────────────────────────────────────────
const SummaryRow: React.FC<{
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}> = ({ label, value, bold = false, valueColor }) => (
  <View style={rowStyles.row}>
    <Text style={[rowStyles.label, bold && rowStyles.bold]}>{label}</Text>
    <Text style={[rowStyles.value, bold && rowStyles.bold, valueColor ? { color: valueColor } : {}]}>
      {value}
    </Text>
  </View>
);

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
  value: { fontSize: 14, fontWeight: '600', color: Colors.black },
  bold: { fontSize: 16, fontWeight: '800', color: Colors.black },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();

  const { subtotal, discount, tax } = route.params;

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [address, setAddress] = useState('House 12, Road 5, Dhanmondi, Dhaka');
  const [latitude, setLatitude] = useState<number | undefined>(route.params?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(route.params?.longitude);
  const [editAddressVisible, setEditAddressVisible] = useState(false);
  const [draftAddress, setDraftAddress] = useState(address);

  // Pick up the location chosen on the map screen (Checkout → MapPicker → back).
  useEffect(() => {
    const p = route.params;
    if (p?.latitude != null && p?.longitude != null && p?.address) {
      setAddress(p.address);
      setLatitude(p.latitude);
      setLongitude(p.longitude);
    }
  }, [route.params?.latitude, route.params?.longitude, route.params?.address]);

  const deliveryFee =
    DELIVERY_OPTIONS.find((o) => o.key === deliveryType)?.fee ?? 60;
  const total = Math.round(subtotal - discount + tax + deliveryFee);

  const handleSaveAddress = () => {
    setAddress(draftAddress);
    setEditAddressVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Delivery Address ─────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Delivery Address</Text>
        <View style={styles.card}>
          <View style={styles.addressRow}>
            <View style={styles.addressIconBox}>
              <Ionicons name="location" size={20} color={Colors.primary} />
            </View>
            <View style={styles.addressText}>
              <Text style={styles.addressTitle}>Home</Text>
              <Text style={styles.addressValue} numberOfLines={2}>
                {address}
              </Text>
            </View>
            <View style={styles.addressActions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate('MapPicker', {
                    subtotal,
                    discount,
                    tax,
                    latitude,
                    longitude,
                    address,
                  })
                }
                activeOpacity={0.8}
              >
                <Ionicons name="map-outline" size={16} color={Colors.primary} />
                <Text style={styles.editBtnText}>Map</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setDraftAddress(address);
                  setEditAddressVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Delivery Type ─────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Delivery Type</Text>
        {DELIVERY_OPTIONS.map((opt) => {
          const active = deliveryType === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.deliveryCard, active && styles.deliveryCardActive]}
              onPress={() => setDeliveryType(opt.key)}
              activeOpacity={0.85}
            >
              {/* Radio dot */}
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>

              <View style={[styles.deliveryIcon, active && styles.deliveryIconActive]}>
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={active ? Colors.primary : Colors.gray}
                />
              </View>

              <View style={styles.deliveryInfo}>
                <Text style={[styles.deliveryLabel, active && { color: Colors.primary }]}>
                  {opt.label}
                </Text>
                <Text style={styles.deliverySub}>{opt.subtitle}</Text>
                <View style={styles.deliveryMeta}>
                  <Ionicons name="time-outline" size={12} color={Colors.gray} />
                  <Text style={styles.deliveryEta}>{opt.eta}</Text>
                </View>
              </View>

              <Text style={[styles.deliveryFee, active && { color: Colors.primary }]}>
                {formatBDT(opt.fee)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* ── Order Summary ─────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Order Summary</Text>
        <View style={styles.card}>
          <SummaryRow label="Subtotal" value={formatBDT(subtotal)} />
          <SummaryRow
            label="Discount"
            value={`-${formatBDT(discount)}`}
            valueColor={Colors.success}
          />
          <SummaryRow label="Tax" value={formatBDT(tax)} />
          <SummaryRow
            label={`Delivery (${deliveryType === 'express' ? 'Express' : 'Standard'})`}
            value={formatBDT(deliveryFee)}
          />
          <View style={styles.divider} />
          <SummaryRow label="Total" value={formatBDT(total)} bold />
        </View>

        {/* ── Promo note ───────────────────────────────────────────────── */}
        <View style={styles.promoNote}>
          <Ionicons name="pricetag-outline" size={14} color={Colors.primary} />
          <Text style={styles.promoNoteText}>
            Promo codes can be applied on the Cart screen
          </Text>
        </View>

        {/* ── Continue button ──────────────────────────────────────────── */}
        <PrimaryButton
          title={`Continue to Payment  •  ${formatBDT(total)}`}
          onPress={() =>
            navigation.navigate('Payment', {
              subtotal,
              discount,
              tax,
              deliveryFee,
              total,
              address,
              latitude,
              longitude,
              deliveryType,
            })
          }
          style={styles.continueBtn}
        />
      </ScrollView>

      {/* ── Edit Address Modal ───────────────────────────────────────────── */}
      <FormModal
        visible={editAddressVisible}
        title="Edit Delivery Address"
        subtitle="Where should we deliver your order?"
        onClose={() => setEditAddressVisible(false)}
        footer={
          <PrimaryButton title="Save Address" onPress={handleSaveAddress} />
        }
      >
        <InputField
          label="Delivery Address"
          icon="location-outline"
          value={draftAddress}
          onChangeText={setDraftAddress}
          placeholder="Enter delivery address"
          multiline
          numberOfLines={3}
        />
      </FormModal>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

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
  scroll: { padding: 20, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },

  // Address card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addressIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: { flex: 1, gap: 2 },
  addressTitle: { fontSize: 13, fontWeight: '700', color: Colors.black },
  addressValue: { fontSize: 13, color: Colors.gray, lineHeight: 18 },
  addressActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  // Delivery option cards
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  deliveryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFAF7',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  deliveryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryIconActive: { backgroundColor: Colors.secondary },
  deliveryInfo: { flex: 1, gap: 2 },
  deliveryLabel: { fontSize: 14, fontWeight: '700', color: Colors.black },
  deliverySub: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  deliveryMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  deliveryEta: { fontSize: 11, color: Colors.gray },
  deliveryFee: { fontSize: 15, fontWeight: '800', color: Colors.black },

  // Summary card
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },

  // Promo note
  promoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  promoNoteText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  continueBtn: { marginTop: 4 },
});
