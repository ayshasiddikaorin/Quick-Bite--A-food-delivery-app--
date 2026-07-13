import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  isLast?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, title, value, isLast = false }) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <View style={styles.rowIconBg}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
    </View>
    <View style={styles.textBox}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

interface AccountRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  status: string;
  connected: boolean;
  isLast?: boolean;
}

const AccountRow: React.FC<AccountRowProps> = ({ icon, title, status, connected, isLast = false }) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <View style={[styles.rowIconBg, { backgroundColor: connected ? '#E8FFF0' : Colors.lightGray }]}>
      <Ionicons name={icon} size={18} color={connected ? Colors.success : Colors.gray} />
    </View>
    <View style={styles.textBox}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={[styles.rowValue, { color: connected ? Colors.success : Colors.primary }]}>
        {status}
      </Text>
    </View>
    <Ionicons
      name={connected ? 'checkmark-circle' : 'add-circle-outline'}
      size={20}
      color={connected ? Colors.success : Colors.primary}
    />
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const ProfileDetailsScreen = ({ navigation }: any) => {
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
        <Text style={styles.title}>Full Profile</Text>
        <TouchableOpacity
          style={styles.editHeaderBtn}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.75}
        >
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile Top Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>AS</Text>
            </View>
          </View>
          <Text style={styles.name}>Aysha Siddika</Text>
          <Text style={styles.email}>ayshasiddika.study@gmail.com</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.memberBadgeText}>Premium Member</Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={16} color={Colors.white} />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Details */}
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.card}>
          <DetailRow icon="person-outline" title="Full Name" value="Aysha Siddika" />
          <DetailRow icon="mail-outline" title="Email" value="ayshasiddika.study@gmail.com" />
          <DetailRow icon="call-outline" title="Phone" value="+8801312939830" />
          <DetailRow icon="location-outline" title="Address" value="Dhaka, Bangladesh" isLast />
        </View>

        {/* Connected Accounts */}
        <Text style={styles.sectionTitle}>Connected Accounts</Text>
        <View style={styles.card}>
          <AccountRow icon="logo-google" title="Google" status="Connected" connected />
          <AccountRow icon="logo-facebook" title="Facebook" status="Connected" connected />
          <AccountRow icon="logo-apple" title="Apple ID" status="Connect" connected={false} isLast />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: 60,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  editHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: Colors.lightGray,
  },
  profileCard: {
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 50,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '500',
    marginBottom: 10,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B8860B',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 20,
  },
  editText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 18,
    paddingHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  rowIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
  },
});

export default ProfileDetailsScreen;
