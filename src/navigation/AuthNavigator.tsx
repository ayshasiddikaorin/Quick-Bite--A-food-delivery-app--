import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserRole } from '../models';

import RoleSelectScreen from '../features/auth/RoleSelectScreen';
import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';

export type AuthStackParamList = {
  RoleSelect: undefined;
  Login: { role: UserRole };
  Register: { role: UserRole };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
