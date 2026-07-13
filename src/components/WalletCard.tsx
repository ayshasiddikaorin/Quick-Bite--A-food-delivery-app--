import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface Props {
  balance: number;
}

const WalletCard: React.FC<Props> = ({ balance }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      {/* BG decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Left */}
      <View style={styles.leftSection}>
        <View style={styles.iconRow}>
          <View style={styles.walletIconBg}>
            <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.cardTitle}>FoodiGo Wallet</Text>
            <Text style={styles.cardSubtitle}>Available Balance</Text>
          </View>
        </View>

        <Text style={styles.balance}>${balance.toFixed(2)}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={styles.actionText}>Top Up</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-up-outline" size={14} color={Colors.primary} />
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Ionicons name="time-outline" size={14} color={Colors.primary} />
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Right chip art */}
      <View style={styles.rightSection}>
        <View style={styles.chip}>
          <View style={styles.chipLine} />
          <View style={styles.chipLine} />
        </View>
        <Ionicons
          name="wifi-outline"
          size={28}
          color={Colors.primary + '60'}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  bgCircle1: {
    position: 'absolute',
    top: -20,
    right: 60,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.secondary,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -30,
    right: -10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0E6',
  },
  leftSection: {
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  walletIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    gap: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '500',
  },
  balance: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionDivider: {
    width: 8,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingLeft: 12,
  },
  chip: {
    width: 36,
    height: 28,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    padding: 5,
    gap: 5,
  },
  chipLine: {
    height: 2,
    backgroundColor: Colors.primary + '60',
    borderRadius: 1,
  },
});

export default WalletCard;
