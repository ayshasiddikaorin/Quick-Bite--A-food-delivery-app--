import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SellerDashboardScreen from '../features/seller/dashboard/SellerDashboardScreen';
import SellerOrdersScreen from '../features/seller/orders/SellerOrdersScreen';
import SellerAddFoodScreen from '../features/seller/menu/SellerAddFoodScreen';
import SellerMenuScreen from '../features/seller/menu/SellerMenuScreen';
import SellerSalesScreen from '../features/seller/sales/SellerSalesScreen';

export type SellerStackParamList = {
  SellerDashboard: undefined;
  SellerOrders: undefined;
  SellerAddFood: undefined;
  SellerMenu: undefined;
  SellerSales: undefined;
};

const Stack = createNativeStackNavigator<SellerStackParamList>();

export default function SellerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} />
      <Stack.Screen name="SellerAddFood" component={SellerAddFoodScreen} />
      <Stack.Screen name="SellerMenu" component={SellerMenuScreen} />
      <Stack.Screen name="SellerSales" component={SellerSalesScreen} />
    </Stack.Navigator>
  );
}
