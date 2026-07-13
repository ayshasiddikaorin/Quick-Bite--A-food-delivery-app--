import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { FoodItem } from '../data/dummyData';
import Colors from '../constants/colors';

interface Props {
  item: FoodItem;
}

const FoodCard: React.FC<Props> = ({ item }) => {
  const [isFav, setIsFav] = useState(item.isFavorite);
  const [cartCount, setCartCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFavPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setIsFav(!isFav);
  };

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={handleFavPress}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={18}
              color={isFav ? Colors.badge : Colors.gray}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Delivery Time Badge */}
        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={10} color={Colors.white} />
          <Text style={styles.timeText}>{item.deliveryTime}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.restaurant} numberOfLines={1}>
          <MaterialIcons name="storefront" size={11} color={Colors.gray} /> {item.restaurant}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={Colors.rating} />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews})</Text>
        </View>

        {/* Price & Cart */}
        <View style={styles.footer}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            {cartCount > 0 ? (
              <View style={styles.cartCountRow}>
                <Ionicons name="cart" size={14} color={Colors.white} />
                <Text style={styles.cartCountText}>{cartCount}</Text>
              </View>
            ) : (
              <Ionicons name="add" size={18} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 175,
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 130,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 3,
  },
  timeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '600',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 3,
  },
  restaurant: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '500',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.black,
  },
  reviews: {
    fontSize: 11,
    color: Colors.gray,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  cartCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cartCountText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default FoodCard;
