import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { BannerItem } from '../data/dummyData';
import Colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 40;

interface Props {
  banners: BannerItem[];
}

const BannerSlider: React.FC<Props> = ({ banners }) => {
  // Use a plain FlatList ref — scrollToIndex works on the underlying FlatList
  const flatListRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.95} style={styles.bannerCard}>
            <Image source={{ uri: item.image }} style={styles.bannerImage} />
            {/* Overlay */}
            <View style={styles.overlay} />
            {/* Text Content */}
            <View style={styles.textContainer}>
              <View style={[styles.tagBadge, { backgroundColor: Colors.white + '30' }]}>
                <Text style={styles.tagText}>🔥 Hot Deal</Text>
              </View>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              <TouchableOpacity style={styles.orderBtn} activeOpacity={0.8}>
                <Text style={styles.orderBtnText}>Order Now</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Dot Indicators */}
      <View style={styles.dotContainer}>
        {banners.map((_, index) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [
              (index - 1) * BANNER_WIDTH,
              index * BANNER_WIDTH,
              (index + 1) * BANNER_WIDTH,
            ],
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  backgroundColor: index === currentIndex ? Colors.primary : Colors.lightGray,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 180,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: 22,
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.white + '40',
  },
  tagText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: Colors.white + 'CC',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  orderBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  orderBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
});

export default BannerSlider;
