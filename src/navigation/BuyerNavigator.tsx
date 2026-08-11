import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BuyerHomeScreen from '../features/buyer/home/BuyerHomeScreen';
import BuyerOffersScreen from '../features/buyer/offers/BuyerOffersScreen';
import CartScreen from '../features/buyer/cart/CartScreen';
import BuyerAccountScreen from '../features/buyer/profile/BuyerAccountScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CheckoutScreen from '../features/buyer/checkout/CheckoutScreen';
import PaymentScreen from '../features/buyer/checkout/PaymentScreen';
import OrderTrackingScreen from '../features/buyer/orderTracking/OrderTrackingScreen';
import RestaurantScreen from '../features/buyer/restaurant/RestaurantScreen';
import BuyerMyOrdersScreen from '../features/buyer/profile/activity/BuyerMyOrdersScreen';
import BuyerFavoritesScreen from '../features/buyer/profile/activity/BuyerFavoritesScreen';
import BuyerNotificationsScreen from '../features/buyer/profile/activity/BuyerNotificationsScreen';
import Colors from '../constants/colors';

// ─── Param lists ──────────────────────────────────────────────────────────────
export type BuyerStackParamList = {
  BuyerTabs: undefined;
  ProfileDetails: undefined;
  EditProfile: undefined;
  BuyerMyOrders: undefined;
  BuyerFavorites: undefined;
  BuyerNotifications: undefined;
  RestaurantPage: {
    restaurantId: string;
    offerDiscount?: number;
  };
  Checkout: {
    subtotal: number;
    discount: number;
    tax: number;
  };
  Payment: {
    subtotal: number;
    discount: number;
    tax: number;
    deliveryFee: number;
    total: number;
    address: string;
    deliveryType: 'standard' | 'express';
  };
  OrderTracking: {
    orderId: string;
    paymentMethod: string;
    total: number;
    address: string;
    deliveryType: 'standard' | 'express';
    isDummy?: boolean;
  };
};

export type BuyerTabParamList = {
  Home: undefined;
  Offers: undefined;
  Cart: undefined;
  Profile: undefined;
};

// ─── Custom Bottom Tab Bar ────────────────────────────────────────────────────
const TAB_CONFIG: Record<
  string,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }
> = {
  Home:    { label: 'Home',    icon: 'home-outline',     activeIcon: 'home' },
  Offers:  { label: 'Offers',  icon: 'pricetag-outline', activeIcon: 'pricetag' },
  Cart:    { label: 'Cart',    icon: 'cart-outline',     activeIcon: 'cart' },
  Profile: { label: 'Profile', icon: 'person-outline',   activeIcon: 'person' },
};

function BuyerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[tabStyles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const cfg = TAB_CONFIG[route.name];
        if (!cfg) return null;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={tabStyles.tab}
            activeOpacity={0.8}
          >
            {isFocused ? (
              <View style={tabStyles.activePill}>
                <Ionicons name={cfg.activeIcon} size={20} color={Colors.white} />
                <Text style={tabStyles.activePillText}>{cfg.label}</Text>
              </View>
            ) : (
              <>
                <Ionicons name={cfg.icon} size={22} color={Colors.gray} />
                <Text style={tabStyles.label}>{cfg.label}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activePillText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '600', color: Colors.gray, marginTop: 3 },
});

// ─── Tab Navigator ────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<BuyerTabParamList>();

function BuyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BuyerTabBar {...props} />}
    >
      <Tab.Screen name="Home"    component={BuyerHomeScreen} />
      <Tab.Screen name="Offers"  component={BuyerOffersScreen} />
      <Tab.Screen name="Cart"    component={CartScreen} />
      <Tab.Screen name="Profile" component={BuyerAccountScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator<BuyerStackParamList>();

export default function BuyerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerTabs"       component={BuyerTabs} />
      <Stack.Screen name="ProfileDetails"  component={ProfileDetailsScreen} />
      <Stack.Screen name="EditProfile"     component={EditProfileScreen} />
      <Stack.Screen name="BuyerMyOrders"       component={BuyerMyOrdersScreen} />
      <Stack.Screen name="BuyerFavorites"      component={BuyerFavoritesScreen} />
      <Stack.Screen name="BuyerNotifications"  component={BuyerNotificationsScreen} />
      <Stack.Screen name="RestaurantPage"  component={RestaurantScreen} />
      <Stack.Screen name="Checkout"        component={CheckoutScreen} />
      <Stack.Screen name="Payment"         component={PaymentScreen} />
      <Stack.Screen name="OrderTracking"   component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
}
