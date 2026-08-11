import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import { useApiData } from '../../../hooks/useApiData';
import { useNotifications } from '../../../context/NotificationContext';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import {
  adminFetchAllRestaurants,
  adminApproveRestaurant,
} from '../../../services/restaurantService';
import type { Restaurant } from '../../../models/restaurant';

const DUMMY_RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Spice Garden', ownerId: 'o1', ownerName: 'Rahim Uddin', cuisine: ['Bangladeshi', 'Indian'], rating: 4.7, reviews: 1420, totalOrders: 1420, coverImage: '', logo: '', phone: '', address: 'Dhanmondi, Dhaka', isOpen: true, isApproved: true, deliveryTime: '20-30 min', deliveryFee: 1.99, minOrder: 8, menuCategories: ['Popular'] },
  { id: '2', name: 'Burger House', ownerId: 'o2', ownerName: 'Sadia Islam', cuisine: ['American', 'Fast Food'], rating: 4.5, reviews: 892, totalOrders: 892, coverImage: '', logo: '', phone: '', address: 'Gulshan, Dhaka', isOpen: true, isApproved: true, deliveryTime: '20-30 min', deliveryFee: 1.99, minOrder: 8, menuCategories: ['Popular'] },
  { id: '3', name: 'Sultan Dine', ownerId: 'o3', ownerName: 'Karim Hossain', cuisine: ['Mughlai', 'Biryani'], rating: 4.8, reviews: 2103, totalOrders: 2103, coverImage: '', logo: '', phone: '', address: 'Banani, Dhaka', isOpen: false, isApproved: true, deliveryTime: '25-35 min', deliveryFee: 2.49, minOrder: 10, menuCategories: ['Popular'] },
  { id: '4', name: 'Green Leaf Café', ownerId: 'o4', ownerName: 'Nusrat Jahan', cuisine: ['Healthy', 'Vegan'], rating: 0, reviews: 0, totalOrders: 0, coverImage: '', logo: '', phone: '', address: 'Uttara, Dhaka', isOpen: false, isApproved: false, deliveryTime: '20-30 min', deliveryFee: 1.99, minOrder: 8, menuCategories: ['Popular'] },
  { id: '5', name: 'The Grill House', ownerId: 'o5', ownerName: 'Rahim Uddin', cuisine: ['BBQ', 'Grills'], rating: 0, reviews: 0, totalOrders: 0, coverImage: '', logo: '', phone: '', address: 'Mirpur, Dhaka', isOpen: false, isApproved: false, deliveryTime: '20-30 min', deliveryFee: 1.49, minOrder: 6, menuCategories: ['Popular'] },
];

const AdminRestaurantsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showPopup } = useNotifications();
  const [confirmRestaurant, setConfirmRestaurant] = useState<{ id: string; name: string } | null>(null);

  const rsState = useApiData(adminFetchAllRestaurants, DUMMY_RESTAURANTS);
  const restaurants = rsState.status !== 'loading' ? rsState.data : DUMMY_RESTAURANTS;
  const status = rsState.status;
  const reload = rsState.reload;

  if (status === 'loading') {
    return <LoadingScreen label="Loading restaurants…" color={Colors.adminAccent} />;
  }

  // Refresh whenever the screen regains focus (e.g. after seller registers a restaurant)
  useFocusEffect(
    React.useCallback(() => { reload(); }, [reload]),
  );

  const handleApprove = (id: string, name: string) => {
    setConfirmRestaurant({ id, name });
  };

  const doApprove = async () => {
    if (!confirmRestaurant) return;
    try {
      await adminApproveRestaurant(confirmRestaurant.id);
      reload();
      showPopup({ title: 'Restaurant Approved ✅', message: `"${confirmRestaurant.name}" is now live.`, variant: 'success', autoDismissMs: 2500 });
    } catch {
      showPopup({ title: 'Offline', message: 'Could not reach backend — changes were not saved.', variant: 'warning' });
    } finally {
      setConfirmRestaurant(null);
    }
  };

  const handleView = (name: string) => {
    showPopup({ title: name, message: 'Full restaurant details will open here in a future update.', variant: 'info', autoDismissMs: 3000 });
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
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

          <Text style={styles.cuisine}>{item.cuisine.join(', ')}</Text>

          <View style={styles.metaRow}>
            {item.isApproved ? (
              <>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={13} color={Colors.warning} />
                  <Text style={styles.metaText}>{item.rating ?? 0}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="receipt-outline" size={13} color={Colors.gray} />
                  <Text style={styles.metaText}>{(item.totalOrders ?? 0).toLocaleString()} orders</Text>
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
        <TouchableOpacity style={styles.backBtn} onPress={reload} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Dummy data mode · backend offline — showing sample restaurants</Text>
        </View>
      )}

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
      <ConfirmModal
        visible={!!confirmRestaurant}
        title="Approve Restaurant"
        message={`Approve "${confirmRestaurant?.name}" so customers can see and order from it?`}
        confirmText="Approve"
        cancelText="Cancel"
        variant="info"
        onConfirm={doApprove}
        onCancel={() => setConfirmRestaurant(null)}
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
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '700', flex: 1 },

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
