import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import LoadingScreen from '../../../components/shared/LoadingScreen';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import FormModal from '../../../components/shared/FormModal';
import InputField from '../../../components/shared/InputField';
import ImagePickField from '../../../components/seller/ImagePickField';
import PrimaryButton from '../../../components/shared/PrimaryButton';
import { useNotifications } from '../../../context/NotificationContext';
import {
  createOffer,
  updateOffer,
  deleteOffer,
  fetchOffersByRestaurant,
} from '../../../services/offerService';
import { fetchMyRestaurant } from '../../../services/restaurantService';
import type { OfferItem } from '../../../models';
import type { SellerStackParamList } from '../../../navigation/SellerNavigator';

type NavProp = NativeStackNavigationProp<SellerStackParamList>;

const EMPTY: OfferItem[] = [];

interface Draft {
  id: string | null;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  image: string;
  bgColor: string;
}

const EMPTY_DRAFT: Draft = {
  id: null,
  title: '',
  description: '',
  discount: '',
  validUntil: '',
  image: '',
  bgColor: '#FF6B00',
};

const BG_COLORS = ['#FF6B00', '#E85520', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];

function fmtDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB');
}

const SellerOffersScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { showPopup } = useNotifications();

  const [offers, setOffers] = useState<OfferItem[]>(EMPTY);
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading');
  const [modalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const restaurant = await fetchMyRestaurant();
      const list = await fetchOffersByRestaurant(restaurant.id);
      setOffers(list);
      setStatus('live');
    } catch {
      setOffers(EMPTY);
      setStatus('fallback');
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => { load(); }, [load]),
  );

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setModalVisible(true);
  };

  const openEdit = (o: OfferItem) => {
    setDraft({
      id: o.id,
      title: o.title,
      description: o.description ?? '',
      discount: String(o.discount),
      validUntil: o.validUntil ? o.validUntil.slice(0, 10) : '',
      image: o.image ?? '',
      bgColor: o.bgColor ?? '#FF6B00',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!draft.title.trim()) { showPopup({ title: 'Title required', message: 'Please enter an offer title.', variant: 'warning' }); return; }
    const disc = Number(draft.discount);
    if (isNaN(disc) || disc <= 0 || disc > 100) { showPopup({ title: 'Invalid discount', message: 'Enter a discount between 1 and 100.', variant: 'warning' }); return; }
    if (!draft.validUntil) { showPopup({ title: 'Valid until required', message: 'Pick an expiry date (YYYY-MM-DD).', variant: 'warning' }); return; }

    setSaving(true);
    try {
      const date = new Date(draft.validUntil + 'T23:59:59.999Z');
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        discount: disc,
        validUntil: date.toISOString(),
        image: draft.image.trim(),
        bgColor: draft.bgColor,
      };
      if (draft.id) {
        await updateOffer(draft.id, payload);
      } else {
        await createOffer(payload);
      }
      showPopup({ title: draft.id ? 'Offer Updated ✅' : 'Offer Created 🎉', message: '', variant: 'success', autoDismissMs: 2200 });
      setModalVisible(false);
      load();
    } catch (err: unknown) {
      showPopup({ title: 'Save Failed', message: `${err instanceof Error ? err.message : 'Something went wrong'}. Connect to the live backend and retry.`, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteOffer(deleteId);
      setOffers((prev) => prev.filter((o) => o.id !== deleteId));
      setDeleteId(null);
    } catch {
      showPopup({ title: 'Delete Failed', message: 'Could not delete the offer.', variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading') {
    return <LoadingScreen label="Loading offers…" color={Colors.sellerAccent} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Offers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {status === 'fallback' && (
        <View style={styles.fallbackBanner}>
          <Ionicons name="cloud-offline-outline" size={13} color={Colors.warning} />
          <Text style={styles.fallbackText}>Backend offline — offer changes unavailable</Text>
          <TouchableOpacity onPress={load}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
        </View>
      )}

      <FlatList
        data={offers}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="pricetag-outline" size={50} color={Colors.border} />
            <Text style={styles.emptyText}>No offers yet — tap + to create one</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: item.bgColor }]}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.discount}% OFF • valid until {fmtDate(item.validUntil)}</Text>
              <View style={[styles.statusChip, { backgroundColor: item.isActive ? Colors.successLight : Colors.lightGray }]}>
                <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.gray }]}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)} activeOpacity={0.8}>
                <Ionicons name="create-outline" size={18} color={Colors.sellerAccent} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteId(item.id)} activeOpacity={0.8}>
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <ConfirmModal
        visible={!!deleteId}
        title="Delete Offer?"
        message="This will permanently remove the offer."
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => { if (!deleting) setDeleteId(null); }}
      />

      <FormModal
        visible={modalVisible}
        title={draft.id ? 'Edit Offer' : 'New Offer'}
        onClose={() => { if (!saving) setModalVisible(false); }}
      >
        <InputField
          label="Title"
          icon="pricetag-outline"
          value={draft.title}
          onChangeText={(t) => setDraft((d) => ({ ...d, title: t }))}
          placeholder="Enter offer title"
        />
        <InputField
          label="Description"
          icon="document-text-outline"
          value={draft.description}
          onChangeText={(t) => setDraft((d) => ({ ...d, description: t }))}
          placeholder="Enter description"
          multiline
          numberOfLines={2}
        />
        <InputField
          label="Discount %"
          icon="calculator-outline"
          value={draft.discount}
          onChangeText={(t) => setDraft((d) => ({ ...d, discount: t }))}
          keyboardType="numeric"
          placeholder="Enter discount"
        />
        <InputField
          label="Valid Until (YYYY-MM-DD)"
          icon="calendar-outline"
          value={draft.validUntil}
          onChangeText={(t) => setDraft((d) => ({ ...d, validUntil: t }))}
          placeholder="Enter date"
          autoCapitalize="none"
        />
        <ImagePickField value={draft.image} onChange={(u) => setDraft((d) => ({ ...d, image: u }))} />

        <Text style={styles.colorLabel}>Card Color</Text>
        <View style={styles.colorRow}>
          {BG_COLORS.map((c) => {
            const active = draft.bgColor === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, active && styles.colorDotActive]}
                onPress={() => setDraft((d) => ({ ...d, bgColor: c }))}
                activeOpacity={0.8}
              />
            );
          })}
        </View>

        <PrimaryButton title="Save Offer" onPress={handleSave} loading={saving} color={Colors.sellerAccent} />
      </FormModal>
    </SafeAreaView>
  );
};

export default SellerOffersScreen;

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
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.black },
  addBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.sellerAccent, alignItems: 'center', justifyContent: 'center',
  },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', paddingHorizontal: 16, paddingVertical: 8,
  },
  fallbackText: { fontSize: 11, color: Colors.warning, fontWeight: '700', flex: 1 },
  retryText: { fontSize: 11, color: Colors.warning, fontWeight: '800', textDecorationLine: 'underline' },
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
    borderLeftWidth: 5,
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.black },
  cardSub: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
  statusChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.gray, fontWeight: '600', textAlign: 'center' },
  colorLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.gray,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginLeft: 2,
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  colorDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: Colors.black, transform: [{ scale: 1.15 }] },
});
