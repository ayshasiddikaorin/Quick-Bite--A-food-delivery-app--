import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboardScreen from '../features/admin/dashboard/AdminDashboardScreen';
import AdminUsersScreen from '../features/admin/users/AdminUsersScreen';
import AdminRestaurantsScreen from '../features/admin/restaurants/AdminRestaurantsScreen';
import AdminOrdersScreen from '../features/admin/orders/AdminOrdersScreen';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminRestaurants: undefined;
  AdminOrders: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminRestaurants" component={AdminRestaurantsScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
    </Stack.Navigator>
  );
}
