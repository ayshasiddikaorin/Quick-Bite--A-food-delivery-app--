import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RecommendedItem } from '../data/dummyData';
import Colors from '../constants/colors';

interface Props {
  item: RecommendedItem;
}

const RecommendedCard: React.FC<Props> = ({ item }) => {
  const [isFav, setIsFav] = useState(false);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.92}>
      {/* Food Image */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Content */}
      <View style={styles.content}>
        {/* Category Tag */}
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

        <View style={styles.restaurantRow}>
          <MaterialIcons name="storefront" size={13} color={Colors.gray} />
          <Text style={styles.restaurantText}>{item.restaurant}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={13} color={Colors.rating} />
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={13} color={Colors.gray} />
            <Text style={styles.statText}>{item.deliveryTime}</Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.stat}>
            <MaterialIcons name="local-fire-department" size={13} color={Colors.primaryLight} />
            <Text style={styles.statText}>{item.calories} cal</Text>
          </View>
        </View>
      </View>

      {/* Right Side */}
      <View style={styles.rightSide}>
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => setIsFav(!isFav)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={17}
            color={isFav ? Colors.badge : Colors.gray}
          />
        </TouchableOpacity>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 14,
    marginHorizontal: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 5,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 3,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 7,
  },
  restaurantText: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    color: Colors.darkGray,
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.lightGray,
  },
  rightSide: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingRight: 14,
    height: 100,
  },
  favBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default RecommendedCard;
