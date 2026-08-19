import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import { restaurants as dummyRestaurants } from '../../../data/dummyData';
import { RestaurantMenuItem, CartItem, RestaurantData } from '../../../models';
import { getCart, saveCart } from '../../../storage/cartStorage';
import { isFavorite, toggleFavorite } from '../../../storage/favoritesStorage';
import { fetchRestaurantById } from '../../../services/restaurantService';
import { fetchMenuByRestaurant } from '../../../services/menuService';
import type { BuyerStackParamList } from '../../../navigation/BuyerNavigator';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { safeImageUri } from '../../../utils/image';
import { formatBDT } from '../../../utils/currency';

type NavProp = NativeStackNavigationProp<BuyerStackParamList>;
type RouteProps = RouteProp<BuyerStackParamList, 'RestaurantPage'>;

const { width: W } = Dimensions.get('window');
const COVER_HEIGHT = 230;
const HEADER_THRESHOLD = COVER_HEIGHT - 60;

// ─── Menu Item Card ───────────────────────────────────────────────────────────
interface MenuItemCardProps {
  item: RestaurantMenuItem;
  offerDiscount?: number;
  onAdd: (item: RestaurantMenuItem) => void;
  qty: number;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, offerDiscount, onAdd, qty }) => {
  const discount = offerDiscount ?? item.discount ?? 0;
  const finalPrice = discount > 0 ? item.price * (1 - discount / 100) : item.price;

  return (
    <View style={cardStyles.card}>
      <Image source={{ uri: safeImageUri(item.image) }} style={cardStyles.image} />
      {item.isPopular && (
        <View style={cardStyles.popularBadge}>
          <MaterialIcons name="local-fire-department" size={11} color={Colors.white} />
          <Text style={cardStyles.popularText}>Popular</Text>
        </View>
      )}
      {discount > 0 && (
        <View style={cardStyles.offerBadge}>
          <Text style={cardStyles.offerText}>{discount}% OFF</Text>
        </View>
      )}
      <View style={cardStyles.info}>
        <Text style={cardStyles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={cardStyles.desc} numberOfLines={2}>{item.description}</Text>
        <View style={cardStyles.footer}>
          <View>
            {discount > 0 && <Text style={cardStyles.originalPrice}>{formatBDT(item.price)}</Text>}
            <Text style={cardStyles.price}>{formatBDT(finalPrice)}</Text>
          </View>
          {qty > 0 ? (
            <View style={cardStyles.qtyRow}>
              <TouchableOpacity
                style={[cardStyles.qtyBtn, { backgroundColor: Colors.lightGray }]}
                onPress={() => onAdd({ ...item, price: finalPrice, id: `remove_${item.id}` })}
              >
                <Ionicons name="remove" size={16} color={Colors.black} />
              </TouchableOpacity>
              <Text style={cardStyles.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={[cardStyles.qtyBtn, { backgroundColor: Colors.primary }]}
                onPress={() => onAdd({ ...item, price: finalPrice })}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={cardStyles.addBtn} onPress={() => onAdd({ ...item, price: finalPrice })} activeOpacity={0.85}>
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 18,
    marginBottom: 12, overflow: 'hidden', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  image: { width: 110, height: 110, resizeMode: 'cover' },
  popularBadge: {
    position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primary, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  popularText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
  offerBadge: {
    position: 'absolute', top: 8, right: 8, backgroundColor: Colors.success,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  offerText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  name: { fontSize: 14, fontWeight: '800', color: Colors.black, marginBottom: 3 },
  desc: { fontSize: 11, color: Colors.gray, lineHeight: 16, flex: 1, marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  originalPrice: { fontSize: 11, color: Colors.gray, textDecorationLine: 'line-through', fontWeight: '500' },
  price: { fontSize: 16, fontWeight: '900', color: Colors.primary },
  addBtn: {
    width: 34, height: 34, borderRadius: 11, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 15, fontWeight: '800', color: Colors.black, minWidth: 16, textAlign: 'center' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const RestaurantScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { restaurantId, offerDiscount } = route.params;

  const { user } = useAuth();
  const { showPopup } = useNotifications();

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [menu, setMenu] = useState<RestaurantMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromFallback, setFromFallback] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [cartQty, setCartQty] = useState<Record<string, number>>({});
  const [isFav, setIsFav] = useState(false);

  // Load restaurant + menu with fallback
  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled && loading) {
        const fallback = dummyRestaurants.find((r) => r.id === restaurantId) ?? dummyRestaurants[0];
        setRestaurant(fallback);
        setMenu(fallback.menu);
        setFromFallback(true);
        setLoading(false);
      }
    }, 5000);

    (async () => {
      try {
        const [r, m] = await Promise.all([
          fetchRestaurantById(restaurantId),
          fetchMenuByRestaurant(restaurantId),
        ]);
        if (!cancelled) {
          // Merge API menu into restaurant shape
          setRestaurant({ ...r, menu: m });
          setMenu(m);
          setFromFallback(false);
        }
      } catch {
        if (!cancelled) {
          const fallback = dummyRestaurants.find((r) => r.id === restaurantId) ?? dummyRestaurants[0];
          setRestaurant(fallback);
          setMenu(fallback.menu);
          setFromFallback(true);
        }
      } finally {
        if (!cancelled) { clearTimeout(timeout); setLoading(false); }
      }
    })();

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [restaurantId]);

  // Read persisted favorite state for this restaurant
  useEffect(() => {
    let cancelled = false;
    isFavorite(restaurantId).then((fav) => {
      if (!cancelled) setIsFav(fav);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [restaurantId, user?.userId]);

  const requireLogin = () => {
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

  const handleToggleFav = async () => {
    if (!user) { requireLogin(); return; }
    if (!restaurant) return;
    const updated = await toggleFavorite(restaurant);
    setIsFav(updated.some((r) => r.id === restaurant.id));
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [HEADER_THRESHOLD - 40, HEADER_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const coverTranslate = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT],
    outputRange: [0, -COVER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const handleAddToCart = useCallback(async (menuItem: RestaurantMenuItem & { price: number }) => {
    if (!user) { requireLogin(); return; }
    if (!restaurant) return;
    const isRemove = menuItem.id.startsWith('remove_');
    const realId = isRemove ? menuItem.id.replace('remove_', '') : menuItem.id;

    setCartQty((prev) => {
      const current = prev[realId] ?? 0;
      const next = isRemove ? Math.max(0, current - 1) : current + 1;
      return { ...prev, [realId]: next };
    });

    try {
      const cart: CartItem[] = await getCart();
      const existingIdx = cart.findIndex((c) => c.id === `${restaurantId}_${realId}`);
      if (isRemove) {
        if (existingIdx >= 0) {
          if (cart[existingIdx].quantity <= 1) cart.splice(existingIdx, 1);
          else cart[existingIdx].quantity -= 1;
        }
      } else {
        if (existingIdx >= 0) {
          cart[existingIdx].quantity += 1;
        } else {
          const realItem = menu.find((m) => m.id === realId)!;
          cart.push({
            id: `${restaurantId}_${realId}`,
            menuItemId: realId,
            restaurantId,
            restaurantName: restaurant.name,
            name: realItem.name,
            image: realItem.image,
            rating: restaurant.rating,
            price: menuItem.price,
            quantity: 1,
          });
        }
      }
      await saveCart(cart);
    } catch { /* non-critical */ }
  }, [restaurant, restaurantId, menu, user, showPopup, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.gray, fontWeight: '500' }}>Loading restaurant…</Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Restaurant not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: Colors.primary, fontWeight: '700' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const declaredCategories = restaurant.menuCategories.filter((c) => c && c !== 'Popular');
  const itemCategories = Array.from(new Set(menu.map((m) => m.category).filter(Boolean)));
  const allCategories = ['Popular', ...Array.from(new Set([...declaredCategories, ...itemCategories]))];
  const popularItems = menu.filter((m) => m.isPopular);
  const filteredMenu =
    activeCategory === 'Popular'
      ? popularItems.length > 0
        ? popularItems
        : menu
      : menu.filter((m) => m.category === activeCategory);
  const totalCartCount = Object.values(cartQty).reduce((s, v) => s + v, 0);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]} pointerEvents="none">
        <Text style={styles.stickyTitle} numberOfLines={1}>{restaurant.name}</Text>
      </Animated.View>

      <SafeAreaView style={styles.topButtons} edges={['top']} pointerEvents="box-none">
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={20} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtn} onPress={handleToggleFav} activeOpacity={0.85}>
          <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? Colors.badge : Colors.black} />
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.coverWrapper, { transform: [{ translateY: coverTranslate }] }]}>
          <Image source={{ uri: safeImageUri(restaurant.coverImage) }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
        </Animated.View>

        <View style={styles.infoCard}>
          {fromFallback && (
            <View style={styles.offlineBanner}>
              <Ionicons name="wifi-outline" size={12} color={Colors.warning} />
              <Text style={styles.offlineText}>Offline preview</Text>
            </View>
          )}
          {offerDiscount && offerDiscount > 0 && (
            <View style={styles.offerRibbon}>
              <Ionicons name="pricetag" size={13} color={Colors.white} />
              <Text style={styles.offerRibbonText}>{offerDiscount}% OFF on all menu items</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.cuisineText}>{restaurant.cuisine.join(' · ')}</Text>
            </View>
            <View style={[styles.openBadge, { backgroundColor: restaurant.isOpen ? Colors.successLight : Colors.errorLight }]}>
              <View style={[styles.openDot, { backgroundColor: restaurant.isOpen ? Colors.success : Colors.error }]} />
              <Text style={[styles.openText, { color: restaurant.isOpen ? Colors.success : Colors.error }]}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.statValue}>{restaurant.rating}</Text>
              <Text style={styles.statLabel}>({restaurant.reviews})</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={Colors.gray} />
              <Text style={styles.statValue}>{restaurant.deliveryTime}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="bicycle-outline" size={14} color={Colors.gray} />
              <Text style={styles.statValue}>{formatBDT(restaurant.deliveryFee)}</Text>
              <Text style={styles.statLabel}>delivery</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="bag-outline" size={14} color={Colors.gray} />
              <Text style={styles.statLabel}>Min {formatBDT(restaurant.minOrder)}</Text>
            </View>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={13} color={Colors.gray} />
            <Text style={styles.addressText}>{restaurant.address}</Text>
          </View>
        </View>

        <View style={styles.categoryWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {allCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catTab, activeCategory === cat && styles.catTabActive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catTabText, activeCategory === cat && styles.catTabTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.menuList}>
          <Text style={styles.menuSectionTitle}>
            {activeCategory === 'Popular' ? '🔥 Most Ordered' : activeCategory}
            <Text style={styles.menuCount}> ({filteredMenu.length})</Text>
          </Text>
          {filteredMenu.length === 0 ? (
            <View style={styles.emptyCategory}>
              <Ionicons name="restaurant-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyCategoryText}>No items in this category</Text>
            </View>
          ) : (
            filteredMenu.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                offerDiscount={offerDiscount}
                onAdd={handleAddToCart}
                qty={cartQty[item.id] ?? 0}
              />
            ))
          )}
        </View>
      </Animated.ScrollView>

      {totalCartCount > 0 && (
        <View style={styles.cartBar}>
          <TouchableOpacity
            style={styles.cartBarBtn}
            onPress={() => navigation.navigate('BuyerTabs', { screen: 'Cart' } as any)}
            activeOpacity={0.88}
          >
            <View style={styles.cartBarBadge}>
              <Text style={styles.cartBarBadgeText}>{totalCartCount}</Text>
            </View>
            <Text style={styles.cartBarText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default RestaurantScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.lightGray },
  safeArea: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: Colors.gray },
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    backgroundColor: Colors.white, paddingTop: 48, paddingBottom: 14, paddingHorizontal: 60,
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stickyTitle: { fontSize: 17, fontWeight: '800', color: Colors.black },
  topButtons: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, zIndex: 30,
  },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  scrollContent: { paddingBottom: 120 },
  coverWrapper: { height: COVER_HEIGHT, width: W },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  infoCard: {
    backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -28, padding: 20,
  },
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFF8E1', borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 5, marginBottom: 10, alignSelf: 'flex-start',
  },
  offlineText: { fontSize: 11, color: Colors.warning, fontWeight: '600' },
  offerRibbon: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.success, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
    marginBottom: 12, alignSelf: 'flex-start',
  },
  offerRibbonText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  infoLeft: { flex: 1, gap: 4 },
  restaurantName: { fontSize: 22, fontWeight: '900', color: Colors.black },
  cuisineText: { fontSize: 13, color: Colors.gray, fontWeight: '500' },
  openBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  openDot: { width: 7, height: 7, borderRadius: 4 },
  openText: { fontSize: 12, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.lightGray, borderRadius: 14, padding: 12, marginBottom: 12,
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  statDivider: { width: 1, height: 20, backgroundColor: Colors.border },
  statValue: { fontSize: 13, fontWeight: '700', color: Colors.black },
  statLabel: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  addressText: { fontSize: 12, color: Colors.gray, flex: 1 },
  categoryWrapper: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  categoryScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.lightGray, borderWidth: 1.5, borderColor: 'transparent',
  },
  catTabActive: { backgroundColor: Colors.secondary, borderColor: Colors.primary },
  catTabText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  catTabTextActive: { color: Colors.primary, fontWeight: '800' },
  menuList: { padding: 16 },
  menuSectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.black, marginBottom: 14 },
  menuCount: { fontSize: 13, fontWeight: '500', color: Colors.gray },
  emptyCategory: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyCategoryText: { fontSize: 14, color: Colors.gray },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 28, paddingTop: 12,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cartBarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary, height: 54, borderRadius: 18,
  },
  cartBarBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
  },
  cartBarBadgeText: { color: Colors.primary, fontSize: 13, fontWeight: '900' },
  cartBarText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});
