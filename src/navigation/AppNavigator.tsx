import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';
import BuyerNavigator from './BuyerNavigator';
import SellerNavigator from './SellerNavigator';
import RiderNavigator from './RiderNavigator';
import AdminNavigator from './AdminNavigator';

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <BuyerNavigator key="guest" />
      ) : user.role === 'buyer' ? (
        <BuyerNavigator key="buyer" />
      ) : user.role === 'seller' ? (
        <SellerNavigator />
      ) : user.role === 'rider' ? (
        <RiderNavigator />
      ) : (
        <AdminNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
});
