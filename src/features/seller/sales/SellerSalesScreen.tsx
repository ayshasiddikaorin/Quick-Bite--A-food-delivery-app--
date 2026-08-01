import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Colors from '../../../constants/colors';

const { width: W } = Dimensions.get('window');

const BAR_DATA = [42, 68, 55, 80, 73, 90, 65];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VAL = Math.max(...BAR_DATA);

const DAILY_SALES = [
  { day: 'Monday', amount: '৳3,360' },
  { day: 'Tuesday', amount: '৳5,440' },
  { day: 'Wednesday', amount: '৳4,400' },
  { day: 'Thursday', amount: '৳6,400' },
  { day: 'Friday', amount: '৳5,840' },
  { day: 'Saturday', amount: '৳7,200' },
  { day: 'Sunday', amount: '৳5,200' },
];

const SellerSalesScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Weekly Total Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalCardTop}>
            <View>
              <Text style={styles.totalLabel}>Weekly Total Sales</Text>
              <Text style={styles.totalAmount}>৳28,540</Text>
            </View>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={16} color={Colors.sellerAccent} />
              <Text style={styles.growthText}>+12.5% this week</Text>
            </View>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalMeta}>
            <View style={styles.totalMetaItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
              <Text style={styles.totalMetaText}>Mon 12 – Sun 18 Jan</Text>
            </View>
            <View style={styles.totalMetaItem}>
              <Ionicons name="receipt-outline" size={16} color={Colors.gray} />
              <Text style={styles.totalMetaText}>473 orders</Text>
            </View>
          </View>
        </View>

        {/* Bar Chart */}
        <Text style={styles.sectionTitle}>Daily Breakdown (Orders)</Text>
        <View style={styles.chartCard}>
          <View style={styles.barsRow}>
            {BAR_DATA.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barValueLabel, i === 5 && { color: Colors.sellerAccent }]}>
                  {val}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (val / MAX_VAL) * 100,
                      backgroundColor: i === 5 ? Colors.sellerAccent : '#C8E6C9',
                    },
                  ]}
                />
                <Text style={[styles.barLabel, i === 5 && { color: Colors.sellerAccent, fontWeight: '700' }]}>
                  {DAYS[i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Sales List */}
        <Text style={styles.sectionTitle}>Sales by Day</Text>
        <View style={styles.listCard}>
          {DAILY_SALES.map((item, index) => (
            <View key={item.day} style={[styles.listRow, index < DAILY_SALES.length - 1 && styles.listRowBorder]}>
              <View style={styles.listLeft}>
                <View
                  style={[
                    styles.dayDot,
                    { backgroundColor: item.day === 'Saturday' ? Colors.sellerAccent : Colors.successLight },
                  ]}
                />
                <Text style={[
                  styles.dayName,
                  item.day === 'Saturday' && { color: Colors.sellerAccent, fontWeight: '800' },
                ]}>
                  {item.day}
                </Text>
              </View>
              <View style={styles.listRight}>
                <Text style={[
                  styles.dayAmount,
                  item.day === 'Saturday' && { color: Colors.sellerAccent },
                ]}>
                  {item.amount}
                </Text>
                {item.day === 'Saturday' && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>Best</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerSalesScreen;

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
  scroll: { padding: 20, paddingBottom: 40 },

  // Total card
  totalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.sellerAccent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  totalCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalLabel: { fontSize: 13, color: Colors.gray, fontWeight: '600', marginBottom: 4 },
  totalAmount: { fontSize: 32, fontWeight: '900', color: Colors.black },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  growthText: { fontSize: 13, fontWeight: '700', color: Colors.sellerAccent },
  totalDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 14 },
  totalMeta: { flexDirection: 'row', gap: 20 },
  totalMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  totalMetaText: { fontSize: 13, color: Colors.gray, fontWeight: '500' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 12,
  },

  // Chart
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 140 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barValueLabel: { fontSize: 10, fontWeight: '600', color: Colors.gray, marginBottom: 2 },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: Colors.gray, fontWeight: '600', marginTop: 4 },

  // List
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayDot: { width: 10, height: 10, borderRadius: 5 },
  dayName: { fontSize: 14, fontWeight: '600', color: Colors.black },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayAmount: { fontSize: 15, fontWeight: '700', color: Colors.black },
  bestBadge: {
    backgroundColor: Colors.sellerAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
});
