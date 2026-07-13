import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';

// Map tab route names → icon names
const TAB_CONFIG: Record<
  string,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }
> = {
  Home: {
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  Offers: {
    label: 'Offers',
    icon: 'pricetag-outline',
    activeIcon: 'pricetag',
  },
  Cart: {
    label: 'Cart',
    icon: 'cart-outline',
    activeIcon: 'cart',
  },
  Profile: {
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
};

const BottomTab: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        // Respect home indicator on iPhone
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        if (!config) return null;

        const isFocused = state.index === index;
        const { label, icon, activeIcon } = config;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            activeOpacity={0.8}
          >
            {/* Cart badge */}
            {route.name === 'Cart' && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>2</Text>
              </View>
            )}

            {isFocused ? (
              <View style={styles.activeIconBg}>
                <Ionicons name={activeIcon} size={22} color={Colors.white} />
              </View>
            ) : (
              <Ionicons name={icon} size={22} color={Colors.gray} />
            )}

            <Text style={[styles.label, isFocused && styles.activeLabel]}>
              {label}
            </Text>

            {isFocused && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
    // Keep the rounded top above the safe area bg
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeIconBg: {
    width: 46,
    height: 38,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray,
    marginTop: 2,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: '15%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.badge,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
});

export default BottomTab;
