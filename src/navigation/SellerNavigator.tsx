import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SellerDashboardScreen from '../features/seller/dashboard/SellerDashboardScreen';
import SellerOrdersScreen from '../features/seller/orders/SellerOrdersScreen';
import SellerAddFoodScreen from '../features/seller/menu/SellerAddFoodScreen';
import SellerMenuScreen from '../features/seller/menu/SellerMenuScreen';
import SellerSalesScreen from '../features/seller/sales/SellerSalesScreen';
import SellerRestaurantSetupScreen from '../features/seller/setup/SellerRestaurantSetupScreen';
import SellerOffersScreen from '../features/seller/offers/SellerOffersScreen';
import SellerEditProfileScreen from '../features/seller/profile/SellerEditProfileScreen';
import type { MenuItem } from '../models';

export type SellerStackParamList = {
  SellerDashboard: undefined;
  SellerRestaurantSetup: { editing?: boolean } | undefined;
  SellerOrders: undefined;
  SellerAddFood: { item?: MenuItem } | undefined;
  SellerMenu: undefined;
  SellerSales: undefined;
  SellerOffers: undefined;
  SellerEditProfile: undefined;
};

const Stack = createNativeStackNavigator<SellerStackParamList>();

export default function SellerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <Stack.Screen name="SellerRestaurantSetup" component={SellerRestaurantSetupScreen} />
      <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} />
      <Stack.Screen name="SellerAddFood" component={SellerAddFoodScreen} />
      <Stack.Screen name="SellerMenu" component={SellerMenuScreen} />
      <Stack.Screen name="SellerSales" component={SellerSalesScreen} />
      <Stack.Screen name="SellerOffers" component={SellerOffersScreen} />
      <Stack.Screen name="SellerEditProfile" component={SellerEditProfileScreen} />
    </Stack.Navigator>
  );
}
