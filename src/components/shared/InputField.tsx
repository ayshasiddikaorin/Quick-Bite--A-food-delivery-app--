import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

interface Props extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

const InputField: React.FC<Props> = ({
  label,
  icon,
  error,
  isPassword = false,
  ...textInputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError,
        ]}
      >
        <View style={styles.iconBg}>
          <Ionicons
            name={icon}
            size={16}
            color={focused ? Colors.primary : Colors.gray}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.gray}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...textInputProps}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.gray}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 7,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 10,
  },
  inputRowFocused: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  inputRowError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  iconBg: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    marginTop: 5,
    marginLeft: 4,
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
});
