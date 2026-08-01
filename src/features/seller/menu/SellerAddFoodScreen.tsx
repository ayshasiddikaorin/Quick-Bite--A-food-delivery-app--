import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import InputField from '../../../components/shared/InputField';
import PrimaryButton from '../../../components/shared/PrimaryButton';

const CATEGORIES = ['Burgers', 'Pizza', 'Chicken', 'Dessert', 'Drinks', 'Rice', 'Noodles', 'Salads'];

const SellerAddFoodScreen: React.FC = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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

  const handleSave = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', `"${name}" has been added to your menu!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food Item</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Image upload placeholder */}
        <TouchableOpacity style={styles.imageUpload} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={36} color={Colors.sellerAccent} />
          <Text style={styles.uploadText}>Tap to upload food photo</Text>
          <Text style={styles.uploadSub}>JPG, PNG • Max 5MB</Text>
        </TouchableOpacity>

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
        </View>

        <PrimaryButton
          title="Add to Menu"
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
  imageUpload: {
    backgroundColor: Colors.successLight,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.sellerAccent,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginBottom: 20,
    gap: 8,
  },
  uploadText: { fontSize: 15, fontWeight: '700', color: Colors.sellerAccent },
  uploadSub: { fontSize: 12, color: Colors.gray },
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
});
