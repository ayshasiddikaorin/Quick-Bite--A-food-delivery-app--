import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { UserProfile } from '../data/accountData';
import Colors from '../constants/colors';

interface Props {
  user: UserProfile;
}

const ProfileCard: React.FC<Props> = ({ user }) => {

  const navigation = useNavigation<any>();

  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.card}>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {!imageError ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          </View>
        )}

        {/* Edit Icon */}
        <TouchableOpacity 
          style={styles.editAvatarBtn} 
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={13} color={Colors.white} />
        </TouchableOpacity>

        {/* Premium Crown */}
        {user.isPremium && (
          <View style={styles.crownBadge}>
            <MaterialIcons 
              name="workspace-premium" 
              size={12} 
              color="#FFD700" 
            />
          </View>
        )}
      </View>


      {/* User Info */}
      <Text style={styles.name}>{user.name}</Text>

      <Text style={styles.email}>
        {user.email}
      </Text>

      <Text style={styles.memberSince}>
        {user.memberSince}
      </Text>


      {/* View Full Profile Button */}
      <TouchableOpacity
        style={styles.profileBtn}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProfileDetails')}
      >
        <Text style={styles.profileBtnText}>
          View Full Profile
        </Text>

        <Ionicons 
          name="chevron-forward" 
          size={15} 
          color={Colors.primary} 
        />
      </TouchableOpacity>


      {/* Stats Row */}
      <View style={styles.statsRow}>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {user.totalOrders}
          </Text>

          <Text style={styles.statLabel}>
            Orders
          </Text>
        </View>


        <View style={styles.statDivider} />


        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {user.loyaltyPoints.toLocaleString()}
          </Text>

          <Text style={styles.statLabel}>
            Points
          </Text>
        </View>


        <View style={styles.statDivider} />


        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${user.walletBalance.toFixed(2)}
          </Text>

          <Text style={styles.statLabel}>
            Wallet
          </Text>
        </View>

      </View>

    </View>
  );
};


const styles = StyleSheet.create({

  card: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },

  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.primary,
  },

  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },

  avatarInitials: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },

  editAvatarBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  crownBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 4,
  },

  email: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.gray,
    marginBottom: 3,
  },

  memberSince: {
    fontSize: 11,
    color: Colors.gray,
    marginBottom: 14,
  },

  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
    gap: 4,
    marginBottom: 20,
  },

  profileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.black,
  },

  statLabel: {
    fontSize: 11,
    color: Colors.gray,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E8',
  },

});


export default ProfileCard;