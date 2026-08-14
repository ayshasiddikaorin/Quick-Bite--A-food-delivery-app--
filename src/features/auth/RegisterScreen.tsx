import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../constants/colors';
import InputField from '../../components/shared/InputField';
import PrimaryButton from '../../components/shared/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { UserRole } from '../../models';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
type RouteProps = RouteProp<AuthStackParamList, 'Register'>;

const ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  buyer: { label: 'Buyer', color: Colors.buyerAccent },
  seller: { label: 'Restaurant Owner', color: Colors.sellerAccent },
  rider: { label: 'Rider', color: Colors.riderAccent },
  admin: { label: 'Admin', color: Colors.adminAccent },
};

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  restaurantName: string;
  vehicleType: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { register } = useAuth();
  const { showPopup } = useNotifications();

  const role: UserRole = route.params?.role ?? 'buyer';
  const cfg = ROLE_CONFIG[role];

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    vehicleType: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (role === 'seller' && !form.restaurantName.trim())
      errs.restaurantName = 'Restaurant name is required';
    if (role === 'rider' && !form.vehicleType.trim())
      errs.vehicleType = 'Vehicle type is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role,
        restaurantName: form.restaurantName.trim() || undefined,
        vehicleType: form.vehicleType.trim() || undefined,
      });
      if (navigation.canGoBack()) navigation.goBack();
    } catch (error: any) {
      showPopup({
        title: 'Registration Failed',
        message: error?.message ?? 'Could not create account. Please try again.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.roleBadge, { backgroundColor: cfg.color + '18' }]}>
          <Text style={[styles.roleBadgeText, { color: cfg.color }]}>
            Registering as {cfg.label}
          </Text>
        </View>

        <Text style={styles.title}>Join Quick Bite</Text>
        <Text style={styles.subtitle}>Fill in the details below to get started</Text>

        <View style={styles.form}>
          <InputField
            label="Full Name"
            icon="person-outline"
            value={form.name}
            onChangeText={set('name')}
            placeholder="John Doe"
            error={errors.name}
          />
          <InputField
            label="Email Address"
            icon="mail-outline"
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            error={errors.email}
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
          {role === 'seller' && (
            <InputField
              label="Restaurant Name"
              icon="storefront-outline"
              value={form.restaurantName}
              onChangeText={set('restaurantName')}
              placeholder="Spice Garden"
              error={errors.restaurantName}
            />
          )}
          {role === 'rider' && (
            <InputField
              label="Vehicle Type"
              icon="bicycle-outline"
              value={form.vehicleType}
              onChangeText={set('vehicleType')}
              placeholder="Motorcycle / Bicycle / Car"
              error={errors.vehicleType}
            />
          )}
          <InputField
            label="Password"
            icon="lock-closed-outline"
            value={form.password}
            onChangeText={set('password')}
            isPassword
            placeholder="••••••••"
            error={errors.password}
          />
          <InputField
            label="Confirm Password"
            icon="lock-closed-outline"
            value={form.confirmPassword}
            onChangeText={set('confirmPassword')}
            isPassword
            placeholder="••••••••"
            error={errors.confirmPassword}
          />
        </View>

        <PrimaryButton
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          color={cfg.color}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login', { role })}
            activeOpacity={0.7}
          >
            <Text style={[styles.loginLink, { color: cfg.color }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  roleBadgeText: { fontSize: 13, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '900', color: Colors.black, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.gray, marginBottom: 28, fontWeight: '500' },
  form: { marginBottom: 8 },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: { fontSize: 14, color: Colors.gray },
  loginLink: { fontSize: 14, fontWeight: '800' },
});
