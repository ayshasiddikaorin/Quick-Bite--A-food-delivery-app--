import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}

const InputField: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  icon,
  keyboardType = 'default',
  multiline = false,
}) => (
  <View style={fieldStyles.wrapper}>
    <Text style={fieldStyles.label}>{label}</Text>
    <View style={[fieldStyles.inputRow, multiline && fieldStyles.inputRowMulti]}>
      <View style={fieldStyles.iconBg}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={Colors.gray}
      />
    </View>
  </View>
);

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 7,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    gap: 10,
  },
  inputRowMulti: {
    height: 100,
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
  },
  inputMulti: {
    height: 72,
    paddingTop: 4,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

const EditProfileScreen = ({ navigation }: any) => {
  const [name, setName] = useState('Aysha Siddika');
  const [email, setEmail] = useState('ayshasiddika.study@gmail.com');
  const [phone, setPhone] = useState('+8801312939830');
  const [address, setAddress] = useState('Dhaka, Bangladesh');

  const handleSave = () => {
    navigation.goBack();
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
        <Text style={styles.title}>Edit Profile</Text>
        {/* spacer to centre title */}
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>AS</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.changePhotoBtn} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={15} color={Colors.primary} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Full Name"
              value={name}
              onChangeText={setName}
              icon="person-outline"
            />
            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
            />
            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              icon="call-outline"
              keyboardType="phone-pad"
            />
            <InputField
              label="Delivery Address"
              value={address}
              onChangeText={setAddress}
              icon="location-outline"
              multiline
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.black,
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: Colors.lightGray,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 56,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.primary,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  form: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    height: 54,
    borderRadius: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  saveText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default EditProfileScreen;
