import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, StackActions } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';

// Each role's landing screen inside its own navigator.
const ROLE_DASHBOARD: Record<string, string> = {
  buyer: 'BuyerTabs',
  seller: 'SellerDashboard',
  rider: 'RiderDashboard',
  admin: 'AdminDashboard',
};

const ROLE_LABEL: Record<string, string> = {
  buyer: 'Buyer',
  seller: 'Restaurant Partner',
  rider: 'Rider',
  admin: 'Admin',
};

const ANIMATION_DURATION_MS = 3200;

/**
 * Beautiful animated entry screen shown right after sign-in / session restore.
 * Plays a short brand animation, then automatically replaces itself with the
 * user's role-specific dashboard.
 */
const RoleEntryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const role = user?.role ?? 'buyer';

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const barScaleX = useRef(new Animated.Value(0)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          delay: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(barScaleX, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(welcomeOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]);

    anim.start();

    const timer = setTimeout(() => {
      navigation.dispatch(StackActions.replace(ROLE_DASHBOARD[role]));
    }, ANIMATION_DURATION_MS);

    return () => {
      anim.stop();
      clearTimeout(timer);
    };
  }, [role, navigation, logoOpacity, logoScale, ringOpacity, titleOpacity, titleTranslate, taglineOpacity, barScaleX, welcomeOpacity]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.bg}>
        {/* Decorative floating circles */}
        <View style={[styles.circle, styles.circleTopRight]} />
        <View style={[styles.circle, styles.circleBottomLeft]} />

        {/* Pulsing ring behind logo */}
        <Animated.View style={[styles.ring, { opacity: ringOpacity }]} />

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoBox,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <MaterialIcons name="local-pizza" size={52} color={Colors.primary} />
        </Animated.View>

        {/* Brand name */}
        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ translateY: titleTranslate }] },
          ]}
        >
          Quick Bite
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Food delivered, fast & fresh
        </Animated.Text>

        {/* Progress bar */}
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { transform: [{ scaleX: barScaleX }] }]} />
        </View>

        {/* Welcome message */}
        <Animated.Text style={[styles.welcome, { opacity: welcomeOpacity }]}>
          Welcome, {ROLE_LABEL[role]}!
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
};

export default RoleEntryScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  bg: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleTopRight: {
    width: 260,
    height: 260,
    top: -60,
    right: -70,
  },
  circleBottomLeft: {
    width: 320,
    height: 320,
    bottom: -110,
    left: -90,
  },

  ring: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  logoBox: {
    width: 104,
    height: 104,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },

  title: {
    marginTop: 26,
    fontSize: 34,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.5,
  },

  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  barTrack: {
    marginTop: 36,
    width: 180,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.white,
  },

  welcome: {
    position: 'absolute',
    bottom: 90,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.4,
  },
});