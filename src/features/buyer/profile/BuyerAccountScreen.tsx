import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ProfileCard from './ProfileCard';
import PromoBanner from '../../../components/PromoBanner';
import WalletCard from '../../../components/WalletCard';
import QuickActionCard from '../../../components/QuickActionCard';
import MenuItem from '../../../components/MenuItem';
import ConfirmModal from '../../../components/shared/ConfirmModal';

import { userProfile, menuGroups } from '../../../data/accountData';
import Colors from '../../../constants/colors';
import { useAuth } from '../../../context/AuthContext';
import type { BuyerStackParamList } from '../../../navigation/BuyerNavigator';

type NavProp = NativeStackNavigationProp<BuyerStackParamList>;

const BuyerAccountScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.accent} />
          <Text style={styles.topBarTitle}>Account</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.75}>
          <Ionicons name="settings-outline" size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileCard user={userProfile} />
        <QuickActionCard />
        <PromoBanner loyaltyPoints={userProfile.loyaltyPoints} />
        <WalletCard balance={userProfile.walletBalance} />

        {menuGroups.map((group) => (
          <View key={group.id} style={styles.menuSection}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, index) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === group.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.85}
          >
            <View style={styles.logoutIconBg}>
              <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionBox}>
          <Text style={styles.versionText}>Foody v1.0.0</Text>
          <Text style={styles.versionSub}>Made with ❤️ for food lovers</Text>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
};

export default BuyerAccountScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accent: { width: 4, height: 22, borderRadius: 2, backgroundColor: Colors.primary },
  topBarTitle: { fontSize: 22, fontWeight: '800', color: Colors.black },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingBottom: 24 },
  menuSection: { marginTop: 22, paddingHorizontal: 20 },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  logoutSection: { paddingHorizontal: 20, marginTop: 22 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.errorLight,
  },
  logoutIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: Colors.error },
  versionBox: { alignItems: 'center', marginTop: 24, marginBottom: 4, gap: 4 },
  versionText: { fontSize: 12, fontWeight: '600', color: Colors.gray },
  versionSub: { fontSize: 11, color: Colors.gray },
});
