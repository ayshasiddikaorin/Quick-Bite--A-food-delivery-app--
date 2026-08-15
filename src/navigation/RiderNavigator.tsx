import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RiderDashboardScreen from '../features/rider/dashboard/RiderDashboardScreen';
import RiderRequestsScreen from '../features/rider/requests/RiderRequestsScreen';
import RiderAcceptedDeliveryScreen from '../features/rider/delivery/RiderAcceptedDeliveryScreen';
import RiderActiveDeliveriesScreen from '../features/rider/activeDelivery/RiderActiveDeliveriesScreen';
import RiderDeliveryHistoryScreen from '../features/rider/history/RiderDeliveryHistoryScreen';
import RiderEarningsScreen from '../features/rider/earnings/RiderEarningsScreen';
import RiderEditProfileScreen from '../features/rider/profile/RiderEditProfileScreen';
import type { Order } from '../models/order';

export type RiderStackParamList = {
  RiderDashboard: undefined;
  RiderRequests: undefined;
  RiderAcceptedDelivery: { order: Order };
  RiderActiveDeliveries: undefined;
  RiderDeliveryHistory: undefined;
  RiderEarnings: undefined;
  RiderEditProfile: undefined;
};

const Stack = createNativeStackNavigator<RiderStackParamList>();

export default function RiderNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RiderDashboard"        component={RiderDashboardScreen} />
      <Stack.Screen name="RiderRequests"         component={RiderRequestsScreen} />
      <Stack.Screen name="RiderAcceptedDelivery" component={RiderAcceptedDeliveryScreen} />
      <Stack.Screen name="RiderActiveDeliveries" component={RiderActiveDeliveriesScreen} />
      <Stack.Screen name="RiderDeliveryHistory"  component={RiderDeliveryHistoryScreen} />
      <Stack.Screen name="RiderEarnings"         component={RiderEarningsScreen} />
      <Stack.Screen name="RiderEditProfile"      component={RiderEditProfileScreen} />
    </Stack.Navigator>
  );
}
