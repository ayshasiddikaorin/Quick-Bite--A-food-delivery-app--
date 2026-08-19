import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RestaurantData } from '../models';
import Colors from '../constants/colors';
import { safeImageUri } from '../utils/image';
import { formatBDT } from '../utils/currency';

interface Props {
  restaurant: RestaurantData;
  onPress?: () => void;
}

const RestaurantCard: React.FC<Props> = ({ restaurant, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: safeImageUri(restaurant.coverImage) }} style={styles.image} />
        <View style={[styles.openBadge, !restaurant.isOpen && styles.closedBadge]}>
          <Ionicons
            name={restaurant.isOpen ? 'time-outline' : 'close'}
            size={10}
            color={Colors.white}
          />
          <Text style={styles.openText}>{restaurant.isOpen ? 'Open' : 'Closed'}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.cuisineRow}>
          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine?.join(' • ')}
          </Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={Colors.rating} />
          <Text style={styles.ratingText}>{restaurant.rating}</Text>
          <Text style={styles.reviews}>({restaurant.reviews})</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.deliveryRow}>
            <Ionicons name="time-outline" size={12} color={Colors.gray} />
            <Text style={styles.deliveryText}>{restaurant.deliveryTime}</Text>
          </View>
          <View style={styles.feeRow}>
            <Ionicons name="bicycle-outline" size={13} color={Colors.gray} />
            <Text style={styles.feeText}>{formatBDT(restaurant.deliveryFee)}</Text>
          </View>
          <View style={styles.addBtn}>
            <Ionicons name="chevron-forward" size={15} color={Colors.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RestaurantCard;

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginRight: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: { position: 'relative', width: '100%', height: 110 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  openBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.success,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  closedBadge: { backgroundColor: Colors.error },
  openText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
  info: { padding: 12 },
  cuisineRow: { marginBottom: 3 },
  cuisine: { fontSize: 10, fontWeight: '600', color: Colors.primary },
  name: { fontSize: 14, fontWeight: '700', color: Colors.black, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 10 },
  ratingText: { fontSize: 12, fontWeight: '700', color: Colors.black },
  reviews: { fontSize: 11, color: Colors.gray },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  deliveryText: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  feeText: { fontSize: 11, color: Colors.gray, fontWeight: '600' },
  addBtn: {
    marginLeft: 'auto',
    width: 26, height: 26, borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
