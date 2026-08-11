import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import Colors from '../../constants/colors';

interface LoadingScreenProps {
  label?: string;
  color?: string;
  variant?: 'full' | 'inline';
}

/**
 * Reusable loading state. Use variant="full" to replace a whole screen while
 * data is being fetched — keeps dummy data hidden until loading resolves.
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  label = 'Loading…',
  color = Colors.primary,
  variant = 'full',
}) => {
  const content = (
    <View style={styles.inner}>
      <ActivityIndicator size="large" color={color} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  if (variant === 'inline') {
    return <View style={styles.inline}>{content}</View>;
  }

  return (
    <SafeAreaView style={styles.full} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center' },
  inner: { alignItems: 'center', gap: 14, padding: 40 },
  label: { fontSize: 14, color: Colors.gray, fontWeight: '600', marginTop: 6 },
  inline: { paddingVertical: 60 },
});

export default LoadingScreen;