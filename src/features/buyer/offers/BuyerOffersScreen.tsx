import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import OfferCard from '../../../components/OfferCard';
import { offers as dummyOffers } from '../../../data/dummyData';
import Colors from '../../../constants/colors';
import { useApiData } from '../../../hooks/useApiData';
import { fetchActiveOffers } from '../../../services/offerService';
import type { OfferItem } from '../../../models';

const BuyerOffersScreen: React.FC = () => {
  const { status, data, reload } = useApiData<OfferItem[]>(fetchActiveOffers, dummyOffers);

  // Refresh whenever the screen regains focus
  useFocusEffect(
    React.useCallback(() => { reload(); }, [reload]),
  );

  const offers = status !== 'loading' ? data : dummyOffers;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.accent} />
          <Text style={styles.title}>Today's Offers</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.75} onPress={reload}>
          {status === 'loading'
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : <Ionicons name="refresh-outline" size={20} color={Colors.black} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.banner}>
              <Ionicons name="pricetag" size={28} color={Colors.white} />
              <View>
                <Text style={styles.bannerTitle}>Exclusive Deals</Text>
                <Text style={styles.bannerSub}>Save big on every order today!</Text>
              </View>
            </View>
            {status === 'fallback' && (
              <View style={styles.fallbackBanner}>
                <Ionicons name="wifi-outline" size={13} color={Colors.warning} />
                <Text style={styles.fallbackText}>Showing offline preview · tap refresh to retry</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <OfferCard item={item} fullWidth />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default BuyerOffersScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accent: { width: 4, height: 22, borderRadius: 2, backgroundColor: Colors.primary },
  title: { fontSize: 22, fontWeight: '800', color: Colors.black },
  filterBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingBottom: 24, backgroundColor: Colors.lightGray },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.primary, margin: 20, borderRadius: 20, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  bannerTitle: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500', marginTop: 2 },
  cardWrapper: { paddingHorizontal: 20, marginBottom: 14 },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 20, marginBottom: 8,
    backgroundColor: '#FFF8E1', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '600', flex: 1 },
});
