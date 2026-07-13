import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Colors from '../constants/colors';

interface Props {
  onApply: (code: string) => void;
}

const PromoCodeCard: React.FC<Props> = ({ onApply }) => {
  const [promoCode, setPromoCode] = useState('');

  return (
    <View style={styles.card}>

      <Text style={styles.title}>
        Promo Code
      </Text>

      <View style={styles.inputRow}>

        <TextInput
          placeholder="Enter promo code"
          placeholderTextColor={Colors.gray}
          value={promoCode}
          onChangeText={setPromoCode}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => onApply(promoCode)}
        >
          <Text style={styles.buttonText}>
            Apply
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default PromoCodeCard;

const styles = StyleSheet.create({

  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
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
    marginBottom: 14,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: Colors.black,
    marginRight: 10,
  },

  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },

});