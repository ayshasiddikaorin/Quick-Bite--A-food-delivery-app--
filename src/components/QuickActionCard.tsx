import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  count?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'q1', label: 'Orders', icon: 'receipt-outline', iconBg: '#FFF0E6', count: '47' },
  { id: 'q2', label: 'Favorites', icon: 'heart-outline', iconBg: '#FFE8E8', count: '12' },
  { id: 'q3', label: 'Addresses', icon: 'location-outline', iconBg: '#E8F4FF' },
  { id: 'q4', label: 'Coupons', icon: 'gift-outline', iconBg: '#F0E8FF', count: 'NEW' },
];

const QuickActionCard: React.FC = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={QUICK_ACTIONS}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} activeOpacity={0.8}>
            <View style={[styles.iconBg, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={22} color={Colors.primary} />
              {item.count !== undefined && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{item.count}</Text>
                </View>
              )}
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
  item: {
    alignItems: 'center',
    gap: 8,
    width: 76,
  },
  iconBg: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  countText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkGray,
    textAlign: 'center',
  },
});

export default QuickActionCard;
