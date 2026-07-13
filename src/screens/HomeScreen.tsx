import React from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import BannerSlider from '../components/BannerSlider';
import FoodCard from '../components/FoodCard';
import OfferCard from '../components/OfferCard';
import RecommendedCard from '../components/RecommendedCard';
import SectionHeader from '../components/SectionHeader';

import {
  banners,
  popularFoods,
  offers,
  recommendedFoods,
} from '../data/dummyData';
import Colors from '../constants/colors';

const CATEGORIES = ['All', '🍔 Burgers', '🍕 Pizza', '🍣 Sushi', '🌮 Mexican', '🍜 Asian'];

const HomeScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState('All');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Header />

          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Hey, <Text style={styles.greetingName}>Aysha 👋</Text>
            </Text>
            <Text style={styles.greetingSubtitle}>What are you craving today?</Text>
          </View>

          {/* Search Bar */}
          <SearchBar />

          {/* Category Chips */}
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => {
              const isActive = activeCategory === item;
              return (
                <TouchableOpacity
                  style={[styles.chip, isActive && styles.activeChip]}
                  onPress={() => setActiveCategory(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isActive && styles.activeChipText]}>
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
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => <FoodCard item={item} />}
            />
          </View>

          {/* Today's Offers */}
          <View style={styles.section}>
            <SectionHeader title="Today's Offers" onSeeAll={() => {}} />
            <FlatList
              data={offers}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => <OfferCard item={item} />}
            />
          </View>

          {/* Recommended */}
          <View style={[styles.section, styles.recommendedSection]}>
            <SectionHeader title="Recommended" onSeeAll={() => {}} />
            <FlatList
              data={recommendedFoods}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => <RecommendedCard item={item} />}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  greetingContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 2,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
  },
  greetingName: {
    color: Colors.primary,
    fontWeight: '800',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
    marginTop: 2,
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray,
  },
  activeChipText: {
    color: Colors.primary,
  },
  section: {
    marginTop: 22,
  },
  recommendedSection: {
    backgroundColor: Colors.white,
  },
  horizontalList: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
});

export default HomeScreen;
