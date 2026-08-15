import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import { useApiData } from '../../../hooks/useApiData';
import {
  fetchMyMenuItems,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from '../../../services/menuService';
import type { MenuItem } from '../../../models';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SellerStackParamList } from '../../../navigation/SellerNavigator';
import { safeImageUri } from '../../../utils/image';

type NavProp = NativeStackNavigationProp<SellerStackParamList>;

const EMPTY_MENU: MenuItem[] = [];

const SellerMenuScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const menuState = useApiData<MenuItem[]>(fetchMyMenuItems, EMPTY_MENU);
  const items = menuState.status !== 'loading' ? menuState.data : EMPTY_MENU;
  const status = menuState.status;
  const reload = menuState.reload;

  // Refresh whenever the screen regains focus (e.g. after add/edit food).
  // MUST be called before any early return to respect the Rules of Hooks.
  useFocusEffect(
    React.useCallback(() => { reload(); }, [reload]),
  );

  if (status === 'loading') {
    return <LoadingScreen label="Loading your menu…" color={Colors.sellerAccent} />;
  }

  const toggleItem = useCallback(async (id: string) => {
    setBusy(id);
    try {
      await toggleMenuItemAvailability(id);
      reload();
    } catch { /* stay on fallback */ }
    finally { setBusy(null); }
  }, [reload]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setBusy(deleteId);
    try {
      await deleteMenuItem(deleteId);
      reload();
    } catch { /* stay on fallback */ }
    finally { setBusy(null); setDeleteId(null); }
  }, [deleteId, reload]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Management</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.reloadBtn} onPress={reload} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={20} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('SellerAddFood', {})}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Backend offline — live menu unavailable</Text>
          <TouchableOpacity onPress={reload}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={52} color={Colors.border} />
            <Text style={styles.emptyText}>No items yet — tap + to add your first item</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image ? (
              <Image source={{ uri: safeImageUri(item.image) }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]}>
                <Ionicons name="fast-food-outline" size={22} color={Colors.gray} />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemCat}>{item.category}</Text>
              <Text style={styles.itemPrice}>৳{item.price}</Text>
            </View>
            <View style={styles.cardActions}>
              {busy === item.id ? (
                <ActivityIndicator size="small" color={Colors.sellerAccent} />
              ) : (
                <Switch
                  value={item.isAvailable}
                  onValueChange={() => toggleItem(item.id)}
                  trackColor={{ false: Colors.border, true: Colors.successLight }}
                  thumbColor={item.isAvailable ? Colors.success : Colors.gray}
                />
              )}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('SellerAddFood', { item })}
              >
                <Ionicons name="create-outline" size={18} color={Colors.sellerAccent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteId(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <ConfirmModal
        visible={!!deleteId}
        title="Delete Item"
        message="This will remove the item from your menu permanently."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </SafeAreaView>
  );
};

export default SellerMenuScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.sellerAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '700', flex: 1 },
  retryText: { fontSize: 11, color: Colors.warning, fontWeight: '800', textDecorationLine: 'underline' },
  list: { padding: 20, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: { width: 58, height: 58, borderRadius: 12 },
  thumbFallback: { backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 15, fontWeight: '700', color: Colors.black },
  itemCat: { fontSize: 12, color: Colors.gray },
  itemPrice: { fontSize: 14, fontWeight: '800', color: Colors.sellerAccent },
  cardActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.gray, fontWeight: '600', textAlign: 'center' },
});