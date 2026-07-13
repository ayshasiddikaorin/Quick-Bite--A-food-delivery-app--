import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import OffersScreen from '../screens/OffersScreen';
import CartScreen from '../screens/CartScreen';
import AccountScreen from '../screens/AccountScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import BottomTab from '../components/BottomTab';

// ─── Stack navigator types ───────────────────────────────────────────────────
export type ProfileStackParamList = {
  Account: undefined;
  ProfileDetails: undefined;
  EditProfile: undefined;
};

// ─── Profile stack (Account + nested screens) ────────────────────────────────
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Account" component={AccountScreen} />
      <ProfileStack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// ─── Bottom tab navigator ─────────────────────────────────────────────────────
export type TabParamList = {
  Home: undefined;
  Offers: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <BottomTab {...props} />}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Offers" component={OffersScreen} />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
