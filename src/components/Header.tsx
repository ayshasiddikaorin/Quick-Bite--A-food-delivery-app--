import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <MaterialIcons name="local-pizza" size={22} color={Colors.white} />
        </View>
        <View>
          <Text style={styles.logoText}>
            Foodi<Text style={styles.logoAccent}>Go</Text>
          </Text>
          <Text style={styles.tagline}>Fast & Fresh Delivery</Text>
        </View>
      </View>

      {/* Right Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color={Colors.black} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconBtn, styles.avatarBtn]} activeOpacity={0.7}>
          <Text style={styles.avatarText}>JD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: Colors.white,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: 0.3,
  },
  logoAccent: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: 10,
    color: Colors.gray,
    fontWeight: '500',
    marginTop: -2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.badge,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  avatarBtn: {
    backgroundColor: Colors.primaryLight,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default Header;
