import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import Colors from '../constants/colors';

interface Props {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
}

const OrderSummary: React.FC<Props> = ({
  subtotal,
  deliveryFee,
  tax,
  discount,
}) => {

  const total =
    subtotal +
    deliveryFee +
    tax -
    discount;

  return (

    <View style={styles.card}>

      <Text style={styles.title}>
        Order Summary
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>
          ${subtotal.toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Delivery</Text>
        <Text style={styles.value}>
          ${deliveryFee.toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Tax</Text>
        <Text style={styles.value}>
          ${tax.toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>
          Discount
        </Text>

        <Text style={styles.discount}>
          -${discount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalText}>
          Total
        </Text>

        <Text style={styles.totalPrice}>
          ${total.toFixed(2)}
        </Text>
      </View>

    </View>

  );

};

export default OrderSummary;

const styles = StyleSheet.create({

  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    color: Colors.gray,
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
  },

  discount: {
    fontSize: 15,
    fontWeight: '700',
    color: 'green',
  },

  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 12,
  },

  totalText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.black,
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },

});