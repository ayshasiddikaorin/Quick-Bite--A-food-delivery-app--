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
  onShopNow: () => void;
}

const EmptyCart: React.FC<Props> = ({ onShopNow }) => {
  return (
    <View style={styles.container}>

      <Ionicons
        name="cart-outline"
        size={90}
        color={Colors.primary}
      />

      <Text style={styles.title}>
        Your Cart is Empty
      </Text>

      <Text style={styles.subtitle}>
        Looks like you haven't added any food yet.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onShopNow}
      >
        <Text style={styles.buttonText}>
          Start Shopping
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default EmptyCart;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 80,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.black,
    marginTop: 20,
  },

  subtitle: {
    fontSize: 15,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },

  button: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 14,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

});