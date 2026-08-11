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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import InputField from '../../../components/shared/InputField';
import PrimaryButton from '../../../components/shared/PrimaryButton';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import ImagePickField from '../../../components/seller/ImagePickField';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { createRestaurant } from '../../../services/restaurantService';
import type { CreateRestaurantRequest } from '../../../models';
import type { SellerStackParamList } from '../../../navigation/SellerNavigator';

type NavProp = NativeStackNavigationProp<SellerStackParamList>;

const CUISINES = ['Bengali', 'Indian', 'Chinese', 'Thai', 'Italian', 'Fast Food', 'Burgers', 'Dessert', 'Seafood', 'Veg'];
const MENU_CATEGORIES = ['Burgers', 'Pizza', 'Chicken', 'Dessert', 'Drinks', 'Rice', 'Noodles', 'Salads'];

interface FormState {
  name: string;
  phone: string;
  address: string;
  deliveryTime: string;
  deliveryFee: string;
  minOrder: string;
  coverImage: string;
  logo: string;
}

type FormErrors = Partial<Record<keyof FormState | 'cuisine' | 'menuCategories', string>>;

const SellerRestaurantSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user, logout } = useAuth();
  const { showPopup } = useNotifications();

  const [form, setForm] = useState<FormState>({
    name: user?.restaurantName ?? '',
    phone: user?.phone ?? '',
    address: '',
    deliveryTime: '30-45 min',
    deliveryFee: '50',
    minOrder: '100',
    coverImage: '',
    logo: '',
  });
  const [cuisine, setCuisine] = useState<string[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showLogout, setShowLogout] = useState(false);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleIn = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((c) => c !== value) : [...list, value];

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Restaurant name is required';
    if (form.deliveryFee && (isNaN(Number(form.deliveryFee)) || Number(form.deliveryFee) < 0))
      errs.deliveryFee = 'Enter a valid fee';
    if (form.minOrder && (isNaN(Number(form.minOrder)) || Number(form.minOrder) < 0))
      errs.minOrder = 'Enter a valid amount';
    if (cuisine.length === 0) errs.cuisine = 'Select at least one cuisine';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload: CreateRestaurantRequest = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      deliveryTime: form.deliveryTime.trim() || '30-45 min',
      deliveryFee: form.deliveryFee ? Number(form.deliveryFee) : undefined,
      minOrder: form.minOrder ? Number(form.minOrder) : undefined,
      cuisine,
      menuCategories,
      coverImage: form.coverImage.trim() || undefined,
      logo: form.logo.trim() || undefined,
    };

    setLoading(true);
    try {
      await createRestaurant(payload);
      showPopup({
        title: 'Restaurant Registered! 🍽️',
        message: 'Your restaurant is set up. Add menu items to start receiving orders.',
        variant: 'success',
        autoDismissMs: 3000,
      });
      navigation.replace('SellerDashboard');
    } catch (err: unknown) {
      showPopup({
        title: 'Registration Failed',
        message: `${err instanceof Error ? err.message : 'Something went wrong'}. Make sure you are connected to the backend and retry.`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <View style={styles.backBtn} />
        <Text style={styles.headerTitle}>Restaurant Setup</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogout(true)}>
          <Ionicons name="log-out-outline" size={19} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="storefront-outline" size={26} color={Colors.sellerAccent} />
          </View>
          <Text style={styles.title}>Get your restaurant online</Text>
          <Text style={styles.subtitle}>
            Tell us about your restaurant so customers can find and order from you.
          </Text>
        </View>

        <View style={styles.form}>
          {/* Photos */}
          <Text style={styles.sectionLabel}>Logo</Text>
          <ImagePickField value={form.logo} onChange={set('logo')} />

          <Text style={styles.sectionLabel}>Cover Photo</Text>
          <ImagePickField value={form.coverImage} onChange={set('coverImage')} />

          <InputField
            label="Restaurant Name"
            icon="storefront-outline"
            value={form.name}
            onChangeText={set('name')}
            placeholder="Spice Garden"
            error={errors.name}
          />
          <InputField
            label="Phone Number"
            icon="call-outline"
            value={form.phone}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
            placeholder="+880 1X XX XXX XXX"
            error={errors.phone}
          />
          <InputField
            label="Address"
            icon="location-outline"
            value={form.address}
            onChangeText={set('address')}
            placeholder="House 12, Road 5, Dhanmondi, Dhaka"
            multiline
            numberOfLines={2}
            error={errors.address}
          />

          {/* Cuisines */}
          <Text style={styles.chipLabel}>Cuisines</Text>
          <View style={styles.chipGrid}>
            {CUISINES.map((c) => {
              const active = cuisine.includes(c);
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => {
                    setCuisine((prev) => toggleIn(prev, c));
                    setErrors((e) => ({ ...e, cuisine: '' }));
                  }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.cuisine ? <Text style={styles.errorText}>{errors.cuisine}</Text> : null}

          {/* Menu categories */}
          <Text style={styles.chipLabel}>Menu Categories</Text>
          <View style={styles.chipGrid}>
            {MENU_CATEGORIES.map((c) => {
              const active = menuCategories.includes(c);
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setMenuCategories((prev) => toggleIn(prev, c))}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <InputField
            label="Delivery Time"
            icon="time-outline"
            value={form.deliveryTime}
            onChangeText={set('deliveryTime')}
            placeholder="30-45 min"
            error={errors.deliveryTime}
          />
          <InputField
            label="Delivery Fee (৳)"
            icon="bicycle-outline"
            value={form.deliveryFee}
            onChangeText={set('deliveryFee')}
            keyboardType="numeric"
            placeholder="50"
            error={errors.deliveryFee}
          />
          <InputField
            label="Minimum Order (৳)"
            icon="cart-outline"
            value={form.minOrder}
            onChangeText={set('minOrder')}
            keyboardType="numeric"
            placeholder="100"
            error={errors.minOrder}
          />
        </View>

        <PrimaryButton
          title="Register Restaurant"
          onPress={handleSave}
          loading={loading}
          color={Colors.sellerAccent}
        />
        <Text style={styles.note}>
          Your restaurant will be visible to customers once an admin approves it.
        </Text>
      </ScrollView>

      <ConfirmModal
        visible={showLogout}
        title="Log Out"
        message="Are you sure you want to log out? You can finish setup next time."
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => { setShowLogout(false); logout(); }}
        onCancel={() => setShowLogout(false)}
      />
    </SafeAreaView>
  );
};

export default SellerRestaurantSetupScreen;

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
  backBtn: { width: 36, height: 36 },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  scroll: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 20 },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: '900', color: Colors.black, marginBottom: 6 },
  subtitle: { fontSize: 13, color: Colors.gray, textAlign: 'center', lineHeight: 18 },
  form: { marginBottom: 12 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 2,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 2,
    marginTop: 6,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: Colors.successLight, borderColor: Colors.sellerAccent },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  chipTextActive: { color: Colors.sellerAccent, fontWeight: '700' },
  errorText: { fontSize: 12, color: Colors.error, marginBottom: 10, marginLeft: 4 },
  note: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 17,
  },
});