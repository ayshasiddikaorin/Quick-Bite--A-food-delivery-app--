import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  loyaltyPoints: number;
}

const PromoBanner: React.FC<Props> = ({ loyaltyPoints }) => {
  const pointsToNext = 2000 - loyaltyPoints;
  const progress = loyaltyPoints / 2000;

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9}>
      {/* Background decoration circles */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      {/* Left: Text content */}
      <View style={styles.leftContent}>
        <View style={styles.labelRow}>
          <MaterialIcons name="workspace-premium" size={14} color="#FFD700" />
          <Text style={styles.labelText}>Premium Member</Text>
        </View>

        <Text style={styles.title}>
          {loyaltyPoints.toLocaleString()} Points
        </Text>
        <Text style={styles.subtitle}>
          {pointsToNext} pts to unlock Gold status
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
        </View>

        <TouchableOpacity style={styles.redeemBtn} activeOpacity={0.85}>
          <Text style={styles.redeemText}>Redeem Now</Text>
          <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Right: Icon */}
      <View style={styles.rightContent}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="local-offer" size={32} color={Colors.white} />
        </View>
        <Text style={styles.iconLabel}>Rewards</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 22,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  circleTopRight: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  leftContent: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  labelText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  progressTrack: {
    width: '90%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 3,
  },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  redeemText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  rightContent: {
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  iconLabel: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default PromoBanner;
