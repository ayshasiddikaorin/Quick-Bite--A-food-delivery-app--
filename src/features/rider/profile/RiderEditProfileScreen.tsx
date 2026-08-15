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
import { fetchRiderProfile, updateRiderProfile } from '../../../services/riderService';
import type { Rider } from '../../../models/rider';

const VEHICLES = ['Motorcycle', 'Bicycle', 'Car'];

const RiderEditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showPopup } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    fetchRiderProfile()
      .then((r: Rider) => {
        if (!mounted) return;
        setName(r.name ?? '');
        setPhone(r.phone ?? '');
        setVehicleType(r.vehicleType ?? 'Motorcycle');
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Enter your name';
    if (!phone.trim()) errs.phone = 'Enter your phone number';
    if (!vehicleType) errs.vehicleType = 'Select a vehicle type';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateRiderProfile({
        name: name.trim(),
        phone: phone.trim(),
        vehicleType,
      });
      showPopup({
        title: 'Profile Updated ✅',
        message: 'Your rider profile has been saved.',
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
            <InputField
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
              placeholder="Enter name"
              error={errors.name}
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

            <Text style={styles.vehicleLabel}>Vehicle Type</Text>
            <View style={styles.vehicleRow}>
              {VEHICLES.map((v) => {
                const active = vehicleType === v;
                return (
                  <TouchableOpacity
                    key={v}
                    style={[styles.vehicleChip, active && styles.vehicleChipActive]}
                    onPress={() => { setVehicleType(v); setErrors((e) => ({ ...e, vehicleType: '' })); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.vehicleChipText, active && styles.vehicleChipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.vehicleType ? <Text style={styles.errorText}>{errors.vehicleType}</Text> : null}

            <View style={{ height: 8 }} />
            <PrimaryButton
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              color={Colors.riderAccent}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RiderEditProfileScreen;

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
  vehicleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 2,
  },
  vehicleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  vehicleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  vehicleChipActive: { backgroundColor: Colors.infoLight, borderColor: Colors.riderAccent },
  vehicleChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  vehicleChipTextActive: { color: Colors.riderAccent, fontWeight: '700' },
  errorText: { fontSize: 12, color: Colors.error, marginBottom: 10, marginLeft: 4 },
});
