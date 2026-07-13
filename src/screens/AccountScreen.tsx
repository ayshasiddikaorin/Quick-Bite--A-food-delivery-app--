import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ProfileCard from '../components/ProfileCard';
import PromoBanner from '../components/PromoBanner';
import WalletCard from '../components/WalletCard';
import QuickActionCard from '../components/QuickActionCard';
import MenuItem from '../components/MenuItem';

import { userProfile, menuGroups } from '../data/accountData';
import Colors from '../constants/colors';

const AccountScreen: React.FC = () => {
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => {} },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.topBarAccent} />
            <Text style={styles.topBarTitle}>Account</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.75}>
            <Ionicons name="settings-outline" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Card */}
          <ProfileCard user={userProfile} />

          {/* Quick Actions */}
          <QuickActionCard />

          {/* Promo / Loyalty Banner */}
          <PromoBanner loyaltyPoints={userProfile.loyaltyPoints} />

          {/* Wallet Card */}
          <WalletCard balance={userProfile.walletBalance} />

          {/* Menu Groups */}
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

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <View style={styles.logoutIconBg}>
                <Ionicons name="log-out-outline" size={18} color={Colors.badge} />
              </View>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>

          {/* Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>FoodiGo v1.0.0</Text>
            <Text style={styles.versionSubText}>Made with ❤️ for food lovers</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarAccent: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: 0.2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  menuSection: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
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
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
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
    borderColor: '#FFE8E8',
  },
  logoutIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFE8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.badge,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 4,
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
  },
  versionSubText: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '400',
  },
});

export default AccountScreen;
