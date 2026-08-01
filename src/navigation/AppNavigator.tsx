import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import BuyerNavigator from './BuyerNavigator';
import SellerNavigator from './SellerNavigator';
import RiderNavigator from './RiderNavigator';
import AdminNavigator from './AdminNavigator';

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : user.role === 'buyer' ? (
        <BuyerNavigator />
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
