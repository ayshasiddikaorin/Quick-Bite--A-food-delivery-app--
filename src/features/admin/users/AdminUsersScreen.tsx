import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Colors from '../../../constants/colors';

type RoleFilter = 'All' | 'Buyers' | 'Sellers' | 'Riders';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'rider';
  isActive: boolean;
}

const MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Aysha Siddika', email: 'aysha@example.com', role: 'buyer', isActive: true },
  { id: '2', name: 'Ahmed Rahman', email: 'ahmed@restaurant.com', role: 'seller', isActive: true },
  { id: '3', name: 'Karim Hossain', email: 'karim@rider.com', role: 'rider', isActive: false },
  { id: '4', name: 'Fatima Begum', email: 'fatima@example.com', role: 'buyer', isActive: true },
  { id: '5', name: 'Rafiq Uddin', email: 'rafiq@grill.com', role: 'seller', isActive: false },
  { id: '6', name: 'Mamun Islam', email: 'mamun@rider.com', role: 'rider', isActive: true },
];

const ROLE_COLORS: Record<MockUser['role'], { color: string; bg: string }> = {
  buyer: { color: Colors.buyerAccent, bg: '#FFF3EE' },
  seller: { color: Colors.sellerAccent, bg: Colors.successLight },
  rider: { color: Colors.riderAccent, bg: Colors.infoLight },
};

const FILTERS: RoleFilter[] = ['All', 'Buyers', 'Sellers', 'Riders'];

const AdminUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<RoleFilter>('All');
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const showActions = (user: MockUser) => {
    Alert.alert(user.name, `Email: ${user.email}`, [
      { text: 'View Profile', onPress: () => {} },
      { text: user.isActive ? 'Deactivate' : 'Activate', onPress: () => toggleStatus(user.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Buyers' && u.role === 'buyer') ||
      (activeFilter === 'Sellers' && u.role === 'seller') ||
      (activeFilter === 'Riders' && u.role === 'rider');

    return matchSearch && matchFilter;
  });

  const renderUser = ({ item }: { item: MockUser }) => {
    const roleStyle = ROLE_COLORS[item.role];
    return (
      <View style={styles.userCard}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: roleStyle.bg }]}>
          <Text style={[styles.avatarText, { color: roleStyle.color }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
            <Text style={[styles.roleBadgeText, { color: roleStyle.color }]}>
              {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.userControls}>
          <TouchableOpacity
            style={[styles.statusToggle, { backgroundColor: item.isActive ? Colors.successLight : Colors.lightGray }]}
            onPress={() => toggleStatus(item.id)}
            activeOpacity={0.85}
          >
            <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.gray }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => showActions(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="ellipsis-vertical" size={18} color={Colors.gray} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={Colors.gray}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredUsers.length} users</Text>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AdminUsersScreen;

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

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.lightGray,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.black, fontWeight: '500' },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  filterChipActive: { backgroundColor: Colors.adminAccent },
  filterChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  filterChipTextActive: { color: Colors.white },

  // Count
  countRow: { paddingHorizontal: 16, paddingVertical: 10 },
  countText: { fontSize: 13, color: Colors.gray, fontWeight: '500' },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '900' },
  userInfo: { flex: 1, gap: 3 },
  userName: { fontSize: 14, fontWeight: '800', color: Colors.black },
  userEmail: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  userControls: { alignItems: 'flex-end', gap: 8 },
  statusToggle: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.gray, fontWeight: '600' },
});
