import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import type { BuyerStackParamList } from '../../../navigation/BuyerNavigator';
import { clearCart } from '../../../storage/cartStorage';

type NavProp = NativeStackNavigationProp<BuyerStackParamList>;
type RouteProps = RouteProp<BuyerStackParamList, 'Payment'>;

type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';

interface PaymentOption {
  key: PaymentMethod;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    key: 'cod',
    label: 'Cash on Delivery',
    subtitle: 'Pay with cash when your order arrives',
    icon: 'cash-outline',
    color: Colors.success,
    bgColor: Colors.successLight,
  },
  {
    key: 'bkash',
    label: 'bKash',
    subtitle: 'Pay via bKash mobile banking',
    icon: 'phone-portrait-outline',
    color: '#E2136E',
    bgColor: '#FCE4EF',
  },
  {
    key: 'nagad',
    label: 'Nagad',
    subtitle: 'Pay via Nagad mobile banking',
    icon: 'phone-portrait-outline',
    color: '#F7941D',
    bgColor: '#FEF3E2',
  },
  {
    key: 'rocket',
    label: 'Rocket',
    subtitle: 'Pay via DBBL Rocket mobile banking',
    icon: 'phone-portrait-outline',
    color: '#8B2FC9',
    bgColor: '#F3E5F5',
  },
  {
    key: 'card',
    label: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, or local cards',
    icon: 'card-outline',
    color: Colors.riderAccent,
    bgColor: Colors.infoLight,
  },
];

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();

  const { subtotal, discount, tax, deliveryFee, total, address, deliveryType } =
    route.params;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedOption = PAYMENT_OPTIONS.find((o) => o.key === selectedMethod)!;

  const handlePlaceOrder = () => setShowConfirm(true);

  const confirmOrder = async () => {
    setShowConfirm(false);
    setPlacing(true);
    // Simulate network call
    await new Promise((r) => setTimeout(r, 1200));
    await clearCart();
    setPlacing(false);
    // Navigate to tracking, replacing the checkout stack so back doesn't return to payment
    navigation.reset({
      index: 0,
      routes: [
        { name: 'BuyerTabs' },
        {
          name: 'OrderTracking',
          params: {
            orderId: `#${Math.floor(1000 + Math.random() * 9000)}`,
            paymentMethod: selectedOption.label,
            total,
            address,
            deliveryType,
          },
        },
      ],
    });
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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Total payable card ───────────────────────────────────────── */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          <View style={styles.totalBreakdown}>
            <Text style={styles.breakdownText}>
              Subtotal ${subtotal.toFixed(2)}  ·  Delivery ${deliveryFee.toFixed(2)}  ·  Tax $
              {tax.toFixed(2)}
            </Text>
            {discount > 0 && (
              <Text style={styles.discountText}>
                Discount −${discount.toFixed(2)} applied
              </Text>
            )}
          </View>
        </View>

        {/* ── Delivery info ────────────────────────────────────────────── */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={Colors.gray} />
          <Text style={styles.infoText} numberOfLines={1}>
            {address}
          </Text>
        </View>
        <View style={[styles.infoRow, { marginBottom: 20 }]}>
          <Ionicons
            name={deliveryType === 'express' ? 'flash-outline' : 'bicycle-outline'}
            size={14}
            color={Colors.gray}
          />
          <Text style={styles.infoText}>
            {deliveryType === 'express' ? 'Express Delivery (15–20 min)' : 'Standard Delivery (30–45 min)'}
          </Text>
        </View>

        {/* ── Payment methods ───────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Select Payment Method</Text>

        {PAYMENT_OPTIONS.map((option) => {
          const active = selectedMethod === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.methodCard, active && { borderColor: option.color }]}
              onPress={() => setSelectedMethod(option.key)}
              activeOpacity={0.85}
            >
              <View style={[styles.methodIcon, { backgroundColor: option.bgColor }]}>
                <Ionicons name={option.icon} size={22} color={option.color} />
              </View>

              <View style={styles.methodInfo}>
                <Text style={[styles.methodLabel, active && { color: option.color }]}>
                  {option.label}
                </Text>
                <Text style={styles.methodSub}>{option.subtitle}</Text>
              </View>

              <View style={[styles.radio, active && { borderColor: option.color }]}>
                {active && (
                  <View style={[styles.radioDot, { backgroundColor: option.color }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* ── Security note ────────────────────────────────────────────── */}
        <View style={styles.secureRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.success} />
          <Text style={styles.secureText}>
            All transactions are secured and encrypted
          </Text>
        </View>
      </ScrollView>

      {/* ── Place Order button ───────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderBtn,
            { backgroundColor: selectedOption.color },
            placing && styles.placingBtn,
          ]}
          onPress={handlePlaceOrder}
          activeOpacity={0.88}
          disabled={placing}
        >
          {placing ? (
            <>
              <ActivityIndicator size="small" color={Colors.white} />
              <Text style={styles.placeOrderText}>Placing Order…</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
              <Text style={styles.placeOrderText}>
                Place Order  ·  ${total.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Confirm modal ────────────────────────────────────────────────── */}
      <ConfirmModal
        visible={showConfirm}
        title="Confirm Order"
        message={`Pay $${total.toFixed(2)} via ${selectedOption.label}?\n\nDelivery to: ${address}`}
        confirmText="Yes, Place Order"
        cancelText="Cancel"
        variant="success"
        onConfirm={confirmOrder}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
};

export default PaymentScreen;

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
  scroll: { padding: 20, paddingBottom: 120 },

  // Total card
  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    gap: 4,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  totalAmount: { color: Colors.white, fontSize: 36, fontWeight: '900' },
  totalBreakdown: { alignItems: 'center', gap: 2 },
  breakdownText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center' },
  discountText: { color: '#A5F3A5', fontSize: 11, fontWeight: '600' },

  // Delivery info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  infoText: { fontSize: 12, color: Colors.gray, flex: 1 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Method cards
  methodCard: {
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
  methodIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: { flex: 1, gap: 2 },
  methodLabel: { fontSize: 14, fontWeight: '700', color: Colors.black },
  methodSub: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },

  // Secure note
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  secureText: { fontSize: 12, color: Colors.success, fontWeight: '600' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  placingBtn: { opacity: 0.75 },
  placeOrderText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});
