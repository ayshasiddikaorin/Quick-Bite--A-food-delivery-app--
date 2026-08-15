import React, { useEffect, useState } from 'react';
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
import InputField from '../../../components/shared/InputField';
import PrimaryButton from '../../../components/shared/PrimaryButton';
import { useNotifications } from '../../../context/NotificationContext';
import { fetchMyProfile, updateMyProfile } from '../../../services/userService';
import type { AuthUser } from '../../../models';

const SellerEditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showPopup } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    fetchMyProfile()
      .then((u: AuthUser) => {
        if (!mounted) return;
        setName(u.name ?? '');
        setPhone(u.phone ?? '');
        setEmail(u.email ?? '');
        setRestaurantName(u.restaurantName ?? '');
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Enter your name';
    if (!phone.trim()) errs.phone = 'Enter your phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateMyProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      showPopup({
        title: 'Profile Updated ✅',
        message: 'Your seller profile has been saved.',
        variant: 'success',
        autoDismissMs: 2500,
      });
      navigation.goBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      showPopup({
        title: 'Update Failed',
        message: `${msg}. Connect to the live backend and retry.`,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading profile…</Text>
        ) : (
          <View style={styles.form}>
            {restaurantName ? (
              <View style={styles.infoCard}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="storefront-outline" size={20} color={Colors.sellerAccent} />
                </View>
                <View style={styles.infoBody}>
                  <Text style={styles.infoLabel}>Restaurant</Text>
                  <Text style={styles.infoValue}>{restaurantName}</Text>
                </View>
              </View>
            ) : null}

            <InputField
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
              placeholder="Enter name"
              error={errors.name}
            />
            <InputField
              label="Email"
              icon="mail-outline"
              value={email}
              editable={false}
              placeholder="Enter email"
            />
            <InputField
              label="Phone Number"
              icon="call-outline"
              value={phone}
              onChangeText={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: '' })); }}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
              error={errors.phone}
            />

            <View style={{ height: 8 }} />
            <PrimaryButton
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              color={Colors.sellerAccent}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerEditProfileScreen;

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
  scroll: { padding: 20 },
  loadingText: { fontSize: 15, color: Colors.gray, fontWeight: '600', textAlign: 'center', marginTop: 40 },
  form: { marginBottom: 12 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: 11, color: Colors.gray, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: '700', color: Colors.black, marginTop: 2 },
});