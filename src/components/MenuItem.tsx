import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItemData } from '../data/accountData';
import Colors from '../constants/colors';

interface Props {
  item: MenuItemData;
  isFirst?: boolean;
  isLast?: boolean;
}

const MenuItem: React.FC<Props> = ({ item, isFirst = false, isLast = false }) => {
  const iconName = item.icon as keyof typeof Ionicons.glyphMap;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        isFirst && styles.firstRow,
        isLast && styles.lastRow,
        !isLast && styles.withBorder,
      ]}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={[styles.iconBg, { backgroundColor: item.iconBg }]}>
        <Ionicons
          name={iconName}
          size={18}
          color={item.isDestructive ? Colors.badge : Colors.primary}
        />
      </View>

      {/* Label */}
      <Text style={[styles.label, item.isDestructive && styles.destructiveLabel]}>
        {item.label}
      </Text>

      {/* Right side */}
      <View style={styles.right}>
        {item.badge !== undefined && (
          <View
            style={[
              styles.badge,
              item.badge === 'NEW' && styles.newBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                item.badge === 'NEW' && styles.newBadgeText,
              ]}
            >
              {item.badge}
            </Text>
          </View>
        )}
        {!item.isDestructive && (
          <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    gap: 14,
  },
  firstRow: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  lastRow: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
  },
  destructiveLabel: {
    color: Colors.badge,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 22,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  newBadge: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default MenuItem;
