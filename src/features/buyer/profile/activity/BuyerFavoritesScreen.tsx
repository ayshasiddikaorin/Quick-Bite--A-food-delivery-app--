import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../../constants/colors';
import type { RestaurantSummary } from '../../../../models';
import { getFavorites, removeFavorite } from '../../../../storage/favoritesStorage';
import type { BuyerStackParamList } from '../../../../navigation/BuyerNavigator';
import { useAuth } from '../../../../context/AuthContext';
import { useNotifications } from '../../../../context/NotificationContext';
import { safeImageUri } from '../../../../utils/image';
import { formatBDT } from '../../../../utils/currency';

type NavProp = NativeStackNavigationProp<BuyerStackParamList>;

const BuyerFavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const { showPopup } = useNotifications();
  const [favorites, setFavorites] = useState<RestaurantSummary[] | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setFavorites([]); return; }
    setFavorites(await getFavorites());
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load]),
  );

  const handleRemove = async (id: string) => {
    setRemoving(id);
    try {
      const updated = await removeFavorite(id);
      setFavorites(updated);
    } finally {
      setRemoving(null);
    }
  };

  const goToRestaurant = (restaurant: RestaurantSummary) => {
    navigation.navigate('RestaurantPage', { restaurantId: restaurant.id });
  };

  const promptLogin = () => {
    showPopup({
      title: 'Sign in required',
      message: 'Please sign in as a buyer to see and manage your favorites.',
      variant: 'warning',
      confirmText: 'Sign In',
      cancelText: 'Not Now',
      showCancel: true,
      onConfirm: () => navigation.navigate('Login', { role: 'buyer' }),
    });
  };

  const loading = favorites === null;

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={52} color={Colors.border} />
          <Text style={styles.emptyTitle}>Sign in to see your favorites</Text>
          <Text style={styles.emptyText}>
            Your favorite restaurants are saved to your account.
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={promptLogin} activeOpacity={0.85}>
            <Text style={styles.browseBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>Loading favorites...</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptyText}>
                Tap the heart on any restaurant to save it here.
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('BuyerTabs', { screen: 'Home' } as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.browseBtnText}>Browse Restaurants</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => goToRestaurant(item)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: safeImageUri(item.coverImage) }} style={styles.cover} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cuisine}>{item.cuisine.join(' · ')}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={12} color={Colors.warning} />
                    <Text style={styles.metaText}>{item.rating}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color={Colors.gray} />
                    <Text style={styles.metaText}>{item.deliveryTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="bicycle-outline" size={12} color={Colors.gray} />
                    <Text style={styles.metaText}>{formatBDT(item.deliveryFee)}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.heartBtn}
                onPress={() => handleRemove(item.id)}
                activeOpacity={0.8}
                disabled={removing === item.id}
              >
                {removing === item.id ? (
                  <ActivityIndicator size="small" color={Colors.badge} />
                ) : (
                  <Ionicons name="heart" size={20} color={Colors.badge} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default BuyerFavoritesScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  list: { padding: 20, paddingBottom: 30 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cover: { width: 64, height: 64, borderRadius: 14, backgroundColor: Colors.lightGray },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 14, fontWeight: '800', color: Colors.black },
  cuisine: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: Colors.gray, fontWeight: '600' },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray },
  emptyText: { fontSize: 13, color: Colors.gray, textAlign: 'center', lineHeight: 20 },
  browseBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
  },
  browseBtnText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
});