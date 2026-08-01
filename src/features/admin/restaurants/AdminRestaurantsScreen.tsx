import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Colors from '../../../constants/colors';

interface MockRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  orderCount: number;
  isApproved: boolean;
}

const MOCK_RESTAURANTS: MockRestaurant[] = [
  {
    id: '1',
    name: 'Spice Garden',
    cuisine: 'Bangladeshi, Indian',
    rating: 4.7,
    orderCount: 1420,
    isApproved: true,
  },
  {
    id: '2',
    name: 'Burger House',
    cuisine: 'American, Fast Food',
    rating: 4.5,
    orderCount: 892,
    isApproved: true,
  },
  {
    id: '3',
    name: 'Sultan Dine',
    cuisine: 'Mughlai, Biryani',
    rating: 4.8,
    orderCount: 2103,
    isApproved: true,
  },
  {
    id: '4',
    name: 'Green Leaf Café',
    cuisine: 'Healthy, Vegan',
    rating: 4.2,
    orderCount: 0,
    isApproved: false,
  },
  {
    id: '5',
    name: 'The Grill House',
    cuisine: 'BBQ, Grills',
    rating: 4.3,
    orderCount: 0,
    isApproved: false,
  },
];

const AdminRestaurantsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [restaurants, setRestaurants] = useState<MockRestaurant[]>(MOCK_RESTAURANTS);

  const handleApprove = (id: string, name: string) => {
    Alert.alert(
      'Approve Restaurant',
      `Are you sure you want to approve "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () =>
            setRestaurants((prev) =>
              prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
            ),
        },
      ]
    );
  };

  const handleView = (name: string) => {
    Alert.alert(name, 'Restaurant details would open here.', [{ text: 'OK' }]);
  };

  const renderRestaurant = ({ item }: { item: MockRestaurant }) => (
    <View style={styles.card}>
      {/* Icon + Info */}
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Ionicons name="storefront-outline" size={24} color={Colors.sellerAccent} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <View
              style={[
                styles.approvalBadge,
                { backgroundColor: item.isApproved ? Colors.successLight : '#FFF3E0' },
              ]}
            >
              <Text
                style={[
                  styles.approvalText,
                  { color: item.isApproved ? Colors.sellerAccent : Colors.warning },
                ]}
              >
                {item.isApproved ? 'Approved' : 'Pending'}
              </Text>
            </View>
          </View>

          <Text style={styles.cuisine}>{item.cuisine}</Text>

          <View style={styles.metaRow}>
            {item.isApproved ? (
              <>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={13} color={Colors.warning} />
                  <Text style={styles.metaText}>{item.rating}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="receipt-outline" size={13} color={Colors.gray} />
                  <Text style={styles.metaText}>{item.orderCount.toLocaleString()} orders</Text>
                </View>
              </>
            ) : (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={Colors.warning} />
                <Text style={[styles.metaText, { color: Colors.warning }]}>Awaiting review</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.cardBottom}>
        {item.isApproved ? (
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => handleView(item.name)}
            activeOpacity={0.85}
          >
            <Ionicons name="eye-outline" size={15} color={Colors.riderAccent} />
            <Text style={styles.viewBtnText}>View Details</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApprove(item.id, item.name)}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={15} color={Colors.white} />
            <Text style={styles.approveBtnText}>Approve Restaurant</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurants</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {restaurants.filter((r) => r.isApproved).length}
          </Text>
          <Text style={styles.summaryLabel}>Approved</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>
            {restaurants.filter((r) => !r.isApproved).length}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{restaurants.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default AdminRestaurantsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.black },

  // Summary
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '900', color: Colors.black },
  summaryLabel: { fontSize: 11, color: Colors.gray, fontWeight: '600', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  // List
  listContent: { padding: 16, paddingBottom: 24 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  name: { fontSize: 15, fontWeight: '800', color: Colors.black, flex: 1, marginRight: 8 },
  approvalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  approvalText: { fontSize: 11, fontWeight: '700' },
  cuisine: { fontSize: 12, color: Colors.gray, fontWeight: '500', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.darkGray, fontWeight: '600' },
  metaDivider: { width: 1, height: 12, backgroundColor: Colors.border },
  cardBottom: {},
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.riderAccent,
  },
  viewBtnText: { fontSize: 13, fontWeight: '700', color: Colors.riderAccent },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.sellerAccent,
  },
  approveBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
});
