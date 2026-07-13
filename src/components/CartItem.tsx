import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import { CartItem } from '../types/cart';

interface Props {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
}

const CartItemCard: React.FC<Props> = ({
  item,
  onIncrease,
  onDecrease,
  onDelete,
}) => {
  return (
    <View style={styles.card}>

      {/* Food Image */}
      <Image
        source={{ uri: item.image }}
        style={styles.image}
      />

      {/* Food Info */}
      <View style={styles.info}>

        <Text style={styles.name}>
          {item.name}
        </Text>

        <Text style={styles.restaurant}>
          {item.restaurant}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons
            name="star"
            size={14}
            color="#FFC107"
          />
          <Text style={styles.rating}>
            {item.rating}
          </Text>
        </View>

        <Text style={styles.price}>
          ${item.price.toFixed(2)}
        </Text>

      </View>

      {/* Right Side */}
      <View style={styles.rightSection}>

        {/* Delete */}
        <TouchableOpacity onPress={onDelete}>
          <Ionicons
            name="trash-outline"
            size={22}
            color={Colors.badge}
          />
        </TouchableOpacity>

        {/* Quantity */}
        <View style={styles.quantityBox}>

          <TouchableOpacity onPress={onDecrease}>
            <Ionicons
              name="remove-circle"
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <Text style={styles.quantity}>
            {item.quantity}
          </Text>

          <TouchableOpacity onPress={onIncrease}>
            <Ionicons
              name="add-circle"
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>

        </View>

      </View>

    </View>
  );
};

export default CartItemCard;

const styles = StyleSheet.create({

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 18,
    padding: 12,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 15,
  },

  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
  },

  restaurant: {
    fontSize: 12,
    color: Colors.gray,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    marginLeft: 4,
    color: Colors.gray,
    fontWeight: '600',
  },

  price: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },

  rightSection: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
  },

});