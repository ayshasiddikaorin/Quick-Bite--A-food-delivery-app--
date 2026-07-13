import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface Props {
  totalItems: number;
}

const CartHeader: React.FC<Props> = ({ totalItems }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.subtitle}>
          {totalItems} item{totalItems > 1 ? 's' : ''}
        </Text>
      </View>

      <TouchableOpacity style={styles.iconButton}>
        <Ionicons
          name="trash-outline"
          size={22}
          color={Colors.badge}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CartHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.black,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.gray,
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFF3F3',

    alignItems: 'center',
    justifyContent: 'center',
  },
});