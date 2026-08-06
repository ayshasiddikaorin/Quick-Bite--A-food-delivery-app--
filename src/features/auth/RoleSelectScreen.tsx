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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../constants/colors';
import { UserRole } from '../../models';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'RoleSelect'>;

interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const ROLES: RoleConfig[] = [
  {
    role: 'buyer',
    label: 'Buyer',
    description: 'Order food from your favourite restaurants',
    icon: 'fast-food-outline',
    color: Colors.buyerAccent,
    bgColor: '#FFF3EE',
  },
  {
    role: 'seller',
    label: 'Restaurant',
    description: 'Manage your orders and menu',
    icon: 'storefront-outline',
    color: Colors.sellerAccent,
    bgColor: '#E8F5E9',
  },
  {
    role: 'rider',
    label: 'Rider',
    description: 'Deliver orders and earn money',
    icon: 'bicycle-outline',
    color: Colors.riderAccent,
    bgColor: '#E3F2FD',
  },
  {
    role: 'admin',
    label: 'Admin',
    description: 'Manage the entire platform',
    icon: 'shield-checkmark-outline',
    color: Colors.adminAccent,
    bgColor: '#F3E5F5',
  },
];

const RoleSelectScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const selectedConfig = ROLES.find((r) => r.role === selected);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <MaterialIcons name="local-pizza" size={28} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.brandName}>
              Quick Bite
            </Text>
            <Text style={styles.brandTagline}>Multi-vendor food delivery</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Welcome back!</Text>
          <Text style={styles.heroSubtitle}>
            Choose how you want to continue
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesGrid}>
          {ROLES.map((cfg) => {
            const isActive = selected === cfg.role;
            return (
              <TouchableOpacity
                key={cfg.role}
                style={[
                  styles.roleCard,
                  isActive && { borderColor: cfg.color, borderWidth: 2 },
                ]}
                onPress={() => setSelected(cfg.role)}
                activeOpacity={0.85}
              >
                <View style={[styles.roleIconCircle, { backgroundColor: cfg.bgColor }]}>
                  <Ionicons name={cfg.icon} size={28} color={cfg.color} />
                </View>
                <Text style={[styles.roleLabel, isActive && { color: cfg.color }]}>
                  {cfg.label}
                </Text>
                <Text style={styles.roleDesc}>{cfg.description}</Text>
                {isActive && (
                  <View style={[styles.checkBadge, { backgroundColor: cfg.color }]}>
                    <Ionicons name="checkmark" size={12} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={[
            styles.continueBtn,
            selected
              ? { backgroundColor: selectedConfig?.color ?? Colors.primary }
              : styles.continueBtnDisabled,
          ]}
          onPress={() => selected && navigation.navigate('Login', { role: selected })}
          disabled={!selected}
          activeOpacity={0.88}
        >
          <Text style={styles.continueBtnText}>
            Continue as {selectedConfig?.label ?? '...'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>

        {/* Sign Up */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Register', { role: selected ?? 'buyer' })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoleSelectScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 24, paddingBottom: 32 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 24,
    marginBottom: 32,
  },
  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  brandName: { fontSize: 22, fontWeight: '900', color: Colors.black },
  brandAccent: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  brandTagline: { fontSize: 12, color: Colors.gray, fontWeight: '500', marginTop: 1 },
  heroSection: { marginBottom: 28 },
  heroTitle: { fontSize: 30, fontWeight: '900', color: Colors.black, marginBottom: 6 },
  heroSubtitle: { fontSize: 15, color: Colors.gray, fontWeight: '500', lineHeight: 22 },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 28 },
  roleCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  roleIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  roleLabel: { fontSize: 16, fontWeight: '800', color: Colors.black },
  roleDesc: {
    fontSize: 11,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  continueBtnDisabled: { backgroundColor: Colors.lightGray },
  continueBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: { fontSize: 14, color: Colors.gray },
  signupLink: { fontSize: 14, fontWeight: '800', color: Colors.primary },
});
