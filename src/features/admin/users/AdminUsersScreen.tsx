import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Colors from '../../../constants/colors';
import { AuthUser, UserRole } from '../../../models/user';
import { useNotifications } from '../../../context/NotificationContext';
import { adminFetchUsers, adminToggleUser } from '../../../services/adminService';

type RoleFilter = 'All' | 'Buyers' | 'Sellers' | 'Riders';

interface UserRow {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

const ROLE_COLORS: Record<'buyer' | 'seller' | 'rider', { color: string; bg: string }> = {
  buyer: { color: Colors.buyerAccent, bg: '#FFF3EE' },
  seller: { color: Colors.sellerAccent, bg: Colors.successLight },
  rider: { color: Colors.riderAccent, bg: Colors.infoLight },
};

const FILTERS: RoleFilter[] = ['All', 'Buyers', 'Sellers', 'Riders'];

const AdminUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showPopup } = useNotifications();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<RoleFilter>('All');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const rows: AuthUser[] = await adminFetchUsers();
      setUsers(
        rows
          .filter((u) => u.role !== 'admin')
          .map((u) => ({
            userId: u.userId,
            name: u.name,
            email: u.email,
            role: u.role as UserRow['role'],
            isActive: u.isActive ?? true,
          }))
      );
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Refresh whenever the screen regains focus
  useFocusEffect(
    useCallback(() => { loadUsers(); }, [loadUsers]),
  );

  const toggleStatus = async (id: string) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      const updated = await adminToggleUser(id);
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === id
            ? { ...u, isActive: updated.isActive ?? !u.isActive }
            : u
        )
      );
    } catch {
      showPopup({ title: 'Update Failed', message: 'Could not update user status. Please try again.', variant: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  const showActions = (user: UserRow) => {
    showPopup({
      title: user.name,
      message: `${user.email}\nRole: ${user.role} • Status: ${user.isActive ? 'Active' : 'Inactive'}`,
      variant: 'info',
      autoDismissMs: 4000,
    });
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

  const renderUser = ({ item }: { item: UserRow }) => {
    const role = (item.role === 'buyer' || item.role === 'seller' || item.role === 'rider') ? item.role : 'buyer';
    const roleStyle = ROLE_COLORS[role];
    const isBusy = togglingId === item.userId;

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
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.userControls}>
          <TouchableOpacity
            style={[styles.statusToggle, { backgroundColor: item.isActive ? Colors.successLight : Colors.lightGray }]}
            onPress={() => toggleStatus(item.userId)}
            activeOpacity={0.85}
            disabled={isBusy}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color={Colors.gray} />
            ) : (
              <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.gray }]}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            )}
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
        <TouchableOpacity style={styles.backBtn} onPress={loadUsers} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.gray} />
          ) : (
            <Ionicons name="refresh-outline" size={20} color={Colors.black} />
          )}
        </TouchableOpacity>
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
        <Text style={styles.countText}>{loading ? 'Loading...' : `${filteredUsers.length} users`}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.adminAccent} />
          <Text style={styles.emptyText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.userId}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={Colors.gray} />
              <Text style={styles.emptyText}>No users found</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadUsers} activeOpacity={0.85}>
                <Text style={styles.retryText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
    minWidth: 56,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
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

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

  // Empty
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.gray, fontWeight: '600' },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.adminAccent,
  },
  retryText: { fontSize: 13, fontWeight: '700', color: Colors.white },
});