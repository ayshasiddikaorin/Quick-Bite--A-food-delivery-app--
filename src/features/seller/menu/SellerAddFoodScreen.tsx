import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import InputField from '../../../components/shared/InputField';
import PrimaryButton from '../../../components/shared/PrimaryButton';
import ImagePickField from '../../../components/seller/ImagePickField';
import { useNotifications } from '../../../context/NotificationContext';
import { createMenuItem, updateMenuItem } from '../../../services/menuService';
import type { MenuItem } from '../../../models';
import type { SellerStackParamList } from '../../../navigation/SellerNavigator';

type NavProp = NativeStackNavigationProp<SellerStackParamList>;
type AddRouteProps = RouteProp<SellerStackParamList, 'SellerAddFood'>;

const CATEGORIES = ['Burgers', 'Pizza', 'Chicken', 'Dessert', 'Drinks', 'Rice', 'Noodles', 'Salads'];

const SellerAddFoodScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<AddRouteProps>();
  const { showPopup } = useNotifications();
  const editing = route.params?.item;

  const [name, setName] = useState(editing?.name ?? '');
  const [price, setPrice] = useState(editing ? String(editing.price) : '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [selectedCategory, setSelectedCategory] = useState(editing?.category ?? '');
  const [imageUrl, setImageUrl] = useState(editing?.image ?? '');
  const [isPopular, setIsPopular] = useState(editing?.isPopular ?? false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Item name is required';
    if (!price.trim()) errs.price = 'Price is required';
    else if (isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Enter a valid price';
    if (!selectedCategory) errs.category = 'Please select a category';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: selectedCategory,
      image: imageUrl.trim(),
      isPopular,
      isAvailable: true,
      discount: 0,
    };

    setLoading(true);
    try {
      if (editing) {
        await updateMenuItem(editing.id, payload);
        showPopup({
          title: 'Item Updated ✅',
          message: `"${name}" has been updated successfully.`,
          variant: 'success',
          autoDismissMs: 2500,
        });
        navigation.goBack();
      } else {
        await createMenuItem(payload);
        showPopup({
          title: 'Item Added 🍽️',
          message: `"${name}" has been added to your menu!`,
          variant: 'success',
          autoDismissMs: 2500,
        });
        navigation.goBack();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      showPopup({
        title: editing ? 'Update Failed' : 'Could Not Add Item',
        message: `${msg}. Connect to the live backend and retry.`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editing ? 'Edit Food Item' : 'Add Food Item'}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Photo upload */}
        <ImagePickField value={imageUrl} onChange={setImageUrl} />

        {/* Image URL */}
        <InputField
          label="Or set image URL"
          icon="link-outline"
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://example.com/food.jpg"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.form}>
          <InputField
            label="Food Name"
            icon="fast-food-outline"
            value={name}
            onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
            placeholder="Classic Burger"
            error={errors.name}
          />
          <InputField
            label="Price (৳)"
            icon="cash-outline"
            value={price}
            onChangeText={(v) => { setPrice(v); setErrors((e) => ({ ...e, price: '' })); }}
            keyboardType="numeric"
            placeholder="250"
            error={errors.price}
          />

          {/* Category Chips */}
          <Text style={styles.categoryLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  selectedCategory === cat && styles.catChipActive,
                ]}
                onPress={() => { setSelectedCategory(cat); setErrors((e) => ({ ...e, category: '' })); }}
              >
                <Text
                  style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

          <InputField
            label="Description"
            icon="document-text-outline"
            value={description}
            onChangeText={(v) => { setDescription(v); setErrors((e) => ({ ...e, description: '' })); }}
            placeholder="A juicy beef patty with fresh veggies..."
            multiline
            numberOfLines={3}
            error={errors.description}
          />

          {/* Popular toggle */}
          <TouchableOpacity
            style={styles.popularRow}
            onPress={() => setIsPopular((v) => !v)}
            activeOpacity={0.85}
          >
            <View style={[styles.checkbox, isPopular && styles.checkboxOn]}>
              {isPopular && <Ionicons name="flame" size={14} color={Colors.white} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.popularTitle}>Mark as popular</Text>
              <Text style={styles.popularSub}>Appears first in the restaurant menu</Text>
            </View>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title={editing ? 'Save Changes' : 'Add to Menu'}
          onPress={handleSave}
          loading={loading}
          color={Colors.sellerAccent}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerAddFoodScreen;

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
  scroll: { padding: 20, paddingBottom: 40 },
  form: { marginBottom: 12 },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 2,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  catChipActive: { backgroundColor: Colors.successLight, borderColor: Colors.sellerAccent },
  catChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  catChipTextActive: { color: Colors.sellerAccent, fontWeight: '700' },
  errorText: { fontSize: 12, color: Colors.error, marginBottom: 10, marginLeft: 4 },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.successLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.sellerAccent, borderColor: Colors.sellerAccent },
  popularTitle: { fontSize: 14, fontWeight: '700', color: Colors.black },
  popularSub: { fontSize: 12, color: Colors.gray, marginTop: 1 },
});