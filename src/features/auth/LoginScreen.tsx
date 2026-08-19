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

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
type RouteProps = RouteProp<AuthStackParamList, 'Login'>;

// Role display config
const ROLE_CONFIG: Record<
  UserRole,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  buyer: { label: 'Buyer', color: Colors.buyerAccent, icon: 'fast-food-outline' },
  seller: { label: 'Restaurant', color: Colors.sellerAccent, icon: 'storefront-outline' },
  rider: { label: 'Rider', color: Colors.riderAccent, icon: 'bicycle-outline' },
  admin: { label: 'Admin', color: Colors.adminAccent, icon: 'shield-checkmark-outline' },
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { login } = useAuth();
  const { showPopup } = useNotifications();

  const role = route.params?.role ?? 'buyer';
  const cfg = ROLE_CONFIG[role];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password, role);
    } catch (error: any) {
      showPopup({
        title: 'Sign In Failed',
        message: error?.message ?? 'Invalid email or password. Please check your credentials.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Role Badge */}
        <View style={[styles.roleBadge, { backgroundColor: cfg.color + '18' }]}>
          <Ionicons name={cfg.icon} size={18} color={cfg.color} />
          <Text style={[styles.roleBadgeText, { color: cfg.color }]}>
            Signing in as {cfg.label}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Enter your credentials to continue</Text>

        {/* Form */}
        <View style={styles.form}>
          <InputField
            label="Email Address"
            icon="mail-outline"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter email"
            error={errors.email}
          />
          <InputField
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            isPassword
            placeholder="Enter password"
            error={errors.password}
          />

          <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
            <Text style={[styles.forgotText, { color: cfg.color }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <PrimaryButton
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          color={cfg.color}
        />

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          {(['logo-google', 'logo-facebook'] as const).map((icon) => (
            <TouchableOpacity key={icon} style={styles.socialBtn} activeOpacity={0.8}>
              <Ionicons name={icon} size={22} color={Colors.black} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Up */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register', { role })}
            activeOpacity={0.7}
          >
            <Text style={[styles.signupLink, { color: cfg.color }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: '700' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 28 },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 14, color: Colors.gray },
  signupLink: { fontSize: 14, fontWeight: '800' },
});
