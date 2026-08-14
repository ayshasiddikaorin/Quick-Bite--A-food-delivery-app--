import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import BannerSlider from '../../../components/BannerSlider';
import FoodCard from '../../../components/FoodCard';
import OfferCard from '../../../components/OfferCard';
import RecommendedCard from '../../../components/RecommendedCard';
import RestaurantCard from '../../../components/RestaurantCard';
import SectionHeader from '../../../components/SectionHeader';
import SearchBar from '../../../components/SearchBar';
import type { BuyerStackParamList } from '../../../navigation/BuyerNavigator';

import {
  banners,
  popularFoods,
  offers as dummyOffers,
  recommendedFoods,
  restaurants as dummyRestaurants,
} from '../../../data/dummyData';
import Colors from '../../../constants/colors';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import { useApiData } from '../../../hooks/useApiData';
import { fetchActiveOffers } from '../../../services/offerService';
import { fetchRestaurantsWithMenus } from '../../../services/restaurantService';
import type {
  OfferItem,
  RestaurantData,
  RestaurantMenuItem,
  FoodItem,
  RecommendedItem,
} from '../../../models';

const CATEGORIES = ['All', '🍔 Burgers', '🍕 Pizza', '🍣 Sushi', '🌮 Mexican', '🍜 Asian'];

// Derive FoodCard-compatible items from RestaurantData
function deriveFoodItems(
  restaurants: RestaurantData[],
  take: (m: RestaurantMenuItem) => boolean,
): FoodItem[] {
  return restaurants.flatMap((r) =>
    r.menu
      .filter(take)
      .slice(0, 2)
      .map((m) => ({
        id: `${r.id}_${m.id}`,
        name: m.name,
        restaurantId: r.id,
        restaurant: r.name,
        rating: r.rating,
        reviews: r.reviews,
        price: m.price,
        image: m.image,
        category: m.category,
        isFavorite: false,
        deliveryTime: r.deliveryTime,
        description: m.description,
      })),
  );
}

// Derive RecommendedCard-compatible items from FoodItem
function toRecommended(items: FoodItem[]): RecommendedItem[] {
  return items.map((f) => ({
    id: f.id,
    name: f.name,
    restaurantId: f.restaurantId,
    restaurant: f.restaurant,
    rating: f.rating,
    price: f.price,
    image: f.image,
    deliveryTime: f.deliveryTime,
    category: f.category,
    calories: f.calories ?? 0,
  }));
}

const BuyerHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount, showPopup } = useNotifications();
  const navigation = useNavigation<NativeStackNavigationProp<BuyerStackParamList>>();
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const firstName = user?.name?.split(' ')[0] ?? 'Guest';

  // ── API data with fallbacks ────────────────────────────────────────────────
  const offersState    = useApiData<OfferItem[]>(fetchActiveOffers, dummyOffers);
  const restaurantState = useApiData<RestaurantData[]>(fetchRestaurantsWithMenus, dummyRestaurants);
  const { reload: reloadOffers } = offersState;
  const { reload: reloadRestaurants } = restaurantState;

  const offers      = offersState.status      !== 'loading' ? offersState.data      : dummyOffers;
  const restaurants = restaurantState.status  !== 'loading' ? restaurantState.data  : dummyRestaurants;

  const isLoading = offersState.status === 'loading' || restaurantState.status === 'loading';

  // Refresh whenever the screen regains focus (e.g. after an action elsewhere)
  useFocusEffect(
    useCallback(() => {
      reloadOffers();
      reloadRestaurants();
    }, [reloadOffers, reloadRestaurants]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([reloadOffers(), reloadRestaurants()]);
    setRefreshing(false);
  }, [reloadOffers, reloadRestaurants]);

  // Derive popular & recommended food lists from live restaurant data
  const livePopular      = deriveFoodItems(restaurants, (m) => m.isPopular);
  const liveRecommended  = deriveFoodItems(restaurants, (m) => m.isAvailable !== false);
  const popularItems     = livePopular.length > 0 ? livePopular : popularFoods;
  const recommendedItems = liveRecommended.length > 0 ? toRecommended(liveRecommended).slice().reverse() : recommendedFoods;

  const openRestaurant = (restaurantId: string) =>
    navigation.navigate('RestaurantPage', { restaurantId });

  const handleGuestFavorite = () => {
    showPopup({
      title: 'Sign in required',
      message: 'Please sign in as a buyer to save favorites and place orders.',
      variant: 'warning',
      confirmText: 'Sign In',
      cancelText: 'Not Now',
      showCancel: true,
      onConfirm: () => navigation.navigate('Login', { role: 'buyer' }),
    });
  };

  if (isLoading) {
    return <LoadingScreen label="Loading fresh dishes…" color={Colors.primary} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <MaterialIcons name="local-pizza" size={20} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.logoText}>Quick Bite</Text>
              <Text style={styles.tagline}>Dhaka, Bangladesh</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {isLoading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />}
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={20} color={Colors.black} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={22} color={Colors.black} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Greeting ───────────────────────────────────────────────── */}
        <View style={styles.greetingBox}>
          <Text style={styles.greeting}>
            Hey, <Text style={styles.greetingName}>{firstName} 👋</Text>
          </Text>
          <Text style={styles.greetingSub}>What are you craving today?</Text>
        </View>

        <SearchBar />

        {/* ── Categories ─────────────────────────────────────────────── */}
        <FlatList
          data={CATEGORIES}
          keyExtractor={(i) => i}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const active = activeCategory === item;
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => setActiveCategory(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* ── Banners ────────────────────────────────────────────────── */}
        <BannerSlider banners={banners} />

        {/* ── Restaurants ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="Restaurants" onSeeAll={() => {}} />
          <FlatList
            data={restaurants}
            keyExtractor={(r) => r.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <RestaurantCard restaurant={item} onPress={() => openRestaurant(item.id)} />
            )}
          />
        </View>

        {/* ── Popular Foods ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="Popular Foods" onSeeAll={() => {}} />
          <FlatList
            data={popularItems}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <FoodCard
                item={item}
                onPress={() => openRestaurant(item.restaurantId)}
                onFavoritePress={user ? undefined : handleGuestFavorite}
              />
            )}
          />
        </View>

        {/* ── Today's Offers ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="Today's Offers" onSeeAll={() => {}} />
          <FlatList
            data={offers}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => <OfferCard item={item} />}
          />
        </View>

        {/* ── Recommended ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="Recommended" onSeeAll={() => {}} />
          <FlatList
            data={recommendedItems}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <RecommendedCard item={item} onPress={() => openRestaurant(item.restaurantId)} />
            )}
          />
        </View>

        {/* ── Fallback notice ────────────────────────────────────────── */}
        {(offersState.status === 'fallback' || restaurantState.status === 'fallback') && (
          <View style={styles.fallbackBanner}>
            <Ionicons name="wifi-outline" size={14} color={Colors.warning} />
            <Text style={styles.fallbackText}>Showing offline preview — connect to load live data</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuyerHomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 17, fontWeight: '900', color: Colors.black },
  tagline: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  notifBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.badge, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.white,
  },
  notifBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
  greetingBox: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 2 },
  greeting: { fontSize: 22, fontWeight: '700', color: Colors.black },
  greetingName: { color: Colors.primary, fontWeight: '800' },
  greetingSub: { fontSize: 14, color: Colors.gray, fontWeight: '500', marginTop: 2 },
  categoryList: { paddingHorizontal: 20, paddingBottom: 4, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.lightGray, borderWidth: 1.5, borderColor: 'transparent',
  },
  activeChip: { backgroundColor: Colors.secondary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  activeChipText: { color: Colors.primary },
  section: { marginTop: 22 },
  hList: { paddingHorizontal: 20, paddingBottom: 4 },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 20, marginTop: 16, marginBottom: 4,
    backgroundColor: '#FFF8E1', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '600', flex: 1 },
});
