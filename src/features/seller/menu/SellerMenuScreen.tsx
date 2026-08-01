import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SellerStackParamList } from '../../../navigation/SellerNavigator';

type NavProp = NativeStackNavigationProp<SellerStackParamList>;

interface MenuEntry {
  id: string;
  name: string;
  category: string;
  price: string;
  isAvailable: boolean;
}

const MENU_ITEMS: MenuEntry[] = [
  { id: '1', name: 'Classic Burger', category: 'Burgers', price: '৳280', isAvailable: true },
  { id: '2', name: 'Chicken Pizza', category: 'Pizza', price: '৳350', isAvailable: true },
  { id: '3', name: 'Beef Biryani', category: 'Rice', price: '৳220', isAvailable: false },
  { id: '4', name: 'Mango Lassi', category: 'Drinks', price: '৳80', isAvailable: true },
  { id: '5', name: 'Chocolate Cake', category: 'Dessert', price: '৳120', isAvailable: true },
];

const SellerMenuScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [items, setItems] = useState(MENU_ITEMS);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const handleDelete = () => {
    if (deleteId) setItems((prev) => prev.filter((i) => i.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Management</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('SellerAddFood')}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.catDot, { backgroundColor: item.isAvailable ? Colors.success : Colors.gray }]} />
            <View style={styles.cardInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCat}>{item.category}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
            <View style={styles.cardActions}>
              <Switch
                value={item.isAvailable}
                onValueChange={() => toggleAvailability(item.id)}
                trackColor={{ false: Colors.border, true: Colors.successLight }}
                thumbColor={item.isAvailable ? Colors.success : Colors.gray}
              />
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.sellerAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 20, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  cardInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 15, fontWeight: '700', color: Colors.black },
  itemCat: { fontSize: 12, color: Colors.gray },
  itemPrice: { fontSize: 14, fontWeight: '800', color: Colors.sellerAccent },
  cardActions: { alignItems: 'center', gap: 8 },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
