import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import BannerSlider from '../../../components/BannerSlider';
import FoodCard from '../../../components/FoodCard';
import OfferCard from '../../../components/OfferCard';
import RecommendedCard from '../../../components/RecommendedCard';
import SectionHeader from '../../../components/SectionHeader';
import SearchBar from '../../../components/SearchBar';

import { banners, popularFoods, offers, recommendedFoods } from '../../../data/dummyData';
import Colors from '../../../constants/colors';
import { useAuth } from '../../../context/AuthContext';

const CATEGORIES = ['All', '🍔 Burgers', '🍕 Pizza', '🍣 Sushi', '🌮 Mexican', '🍜 Asian'];

const BuyerHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');

  const firstName = user?.name?.split(' ')[0] ?? 'Guest';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <MaterialIcons name="local-pizza" size={20} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.logoText}>
                Foody<Text style={styles.logoAccent}> Fast & Fresh</Text>
              </Text>
              <Text style={styles.tagline}>Dhaka, Bangladesh</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.black} />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingBox}>
          <Text style={styles.greeting}>
            Hey, <Text style={styles.greetingName}>{firstName} 👋</Text>
          </Text>
          <Text style={styles.greetingSub}>What are you craving today?</Text>
        </View>

        {/* Search */}
        <SearchBar />

        {/* Categories */}
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
                <Text style={[styles.chipText, active && styles.activeChipText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Banner Slider */}
        <BannerSlider banners={banners} />

        {/* Popular Foods */}
        <View style={styles.section}>
          <SectionHeader title="Popular Foods" onSeeAll={() => {}} />
          <FlatList
            data={popularFoods}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => <FoodCard item={item} />}
          />
        </View>

        {/* Today's Offers */}
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

        {/* Recommended */}
        <View style={styles.section}>
          <SectionHeader title="Recommended" onSeeAll={() => {}} />
          <FlatList
            data={recommendedFoods}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            renderItem={({ item }) => <RecommendedCard item={item} />}
          />
        </View>
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
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 17, fontWeight: '900', color: Colors.black },
  logoAccent: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  tagline: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.badge,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  notifBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
  greetingBox: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 2 },
  greeting: { fontSize: 22, fontWeight: '700', color: Colors.black },
  greetingName: { color: Colors.primary, fontWeight: '800' },
  greetingSub: { fontSize: 14, color: Colors.gray, fontWeight: '500', marginTop: 2 },
  categoryList: { paddingHorizontal: 20, paddingBottom: 4, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeChip: { backgroundColor: Colors.secondary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  activeChipText: { color: Colors.primary },
  section: { marginTop: 22 },
  hList: { paddingHorizontal: 20, paddingBottom: 4 },
});
