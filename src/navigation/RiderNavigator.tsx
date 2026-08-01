import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RiderDashboardScreen from '../features/rider/dashboard/RiderDashboardScreen';
import RiderRequestsScreen, { DeliveryRequest } from '../features/rider/requests/RiderRequestsScreen';
import RiderAcceptedDeliveryScreen from '../features/rider/delivery/RiderAcceptedDeliveryScreen';
import RiderDeliveryHistoryScreen from '../features/rider/history/RiderDeliveryHistoryScreen';
import RiderEarningsScreen from '../features/rider/earnings/RiderEarningsScreen';

export type RiderStackParamList = {
  RiderDashboard: undefined;
  RiderRequests: undefined;
  RiderAcceptedDelivery: { request: DeliveryRequest };
  RiderDeliveryHistory: undefined;
  RiderEarnings: undefined;
};

const Stack = createNativeStackNavigator<RiderStackParamList>();

export default function RiderNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RiderDashboard"        component={RiderDashboardScreen} />
      <Stack.Screen name="RiderRequests"         component={RiderRequestsScreen} />
      <Stack.Screen name="RiderAcceptedDelivery" component={RiderAcceptedDeliveryScreen} />
      <Stack.Screen name="RiderDeliveryHistory"  component={RiderDeliveryHistoryScreen} />
      <Stack.Screen name="RiderEarnings"         component={RiderEarningsScreen} />
    </Stack.Navigator>
  );
}
