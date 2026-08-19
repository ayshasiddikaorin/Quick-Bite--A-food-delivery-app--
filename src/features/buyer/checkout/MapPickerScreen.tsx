import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Keyboard,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Map, Camera, type CameraRef, type ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Colors from '../../../constants/colors';
import { reverseGeocode, searchPlaces, type SearchGeocodeResult } from '../../../services/geocodeService';
import type { BuyerStackParamList } from '../../../navigation/BuyerNavigator';

type NavProp = NativeStackNavigationProp<BuyerStackParamList, 'MapPicker'>;
type RouteProps = RouteProp<BuyerStackParamList, 'MapPicker'>;

// Free vector map style (OpenFreeMap / OpenStreetMap data) — no API key needed.
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// Default fallback: Dhaka, Bangladesh.
const DEFAULT_LOCATION = { latitude: 23.8103, longitude: 90.4125 };

interface Coord {
  latitude: number;
  longitude: number;
}

const MapPickerScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();

  const cameraRef = useRef<CameraRef>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveSeq = useRef(0);

  const [center, setCenter] = useState<Coord>(DEFAULT_LOCATION);
  const [address, setAddress] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(true);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchGeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);

  // ── Reverse geocode a coordinate (debounced) ────────────────────────────────
  const resolveAddress = useCallback((lat: number, lon: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const seq = ++resolveSeq.current;
      setResolving(true);
      try {
        const r = await reverseGeocode(lat, lon);
        if (seq === resolveSeq.current) setAddress(r.displayName);
      } catch {
        if (seq === resolveSeq.current) {
          setAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        }
      } finally {
        if (seq === resolveSeq.current) setResolving(false);
      }
    }, 400);
  }, []);

  // ── On map pan → track the new center + resolve its address ────────────────
  const handleRegionDidChange = useCallback(
    (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
      const [lon, lat] = event.nativeEvent.center;
      setCenter({ latitude: lat, longitude: lon });
      resolveAddress(lat, lon);
    },
    [resolveAddress],
  );

  // ── Start at the user's current location (fallback: Dhaka) ─────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      let loc = DEFAULT_LOCATION;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        }
      } catch {
        // permissions or GPS unavailable — keep Dhaka default
      }

      if (!mounted) return;
      setCenter(loc);
      setLocating(false);
      // Wait for the Camera to attach, then jump to the location.
      setTimeout(() => {
        cameraRef.current?.jumpTo({ center: [loc.longitude, loc.latitude], zoom: 16 });
        resolveAddress(loc.latitude, loc.longitude);
      }, 300);
    })();
    return () => {
      mounted = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [resolveAddress]);

  // ── Jump back to the user's current position ────────────────────────────────
  const handleMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCenter(loc);
      cameraRef.current?.jumpTo({ center: [loc.longitude, loc.latitude], zoom: 16 });
      resolveAddress(loc.latitude, loc.longitude);
    } catch {
      // ignore — user can still pick a point manually
    }
  };

  // ── Search places ───────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    Keyboard.dismiss();
    setSearching(true);
    try {
      const r = await searchPlaces(q);
      setResults(r);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (r: SearchGeocodeResult) => {
    Keyboard.dismiss();
    setResults([]);
    setQuery('');
    const loc = { latitude: r.latitude, longitude: r.longitude };
    setCenter(loc);
    cameraRef.current?.flyTo({ center: [loc.longitude, loc.latitude], zoom: 16, duration: 1200 });
    resolveAddress(loc.latitude, loc.longitude);
  };

  // ── Confirm → return the picked location to Checkout ────────────────────────
  const handleConfirm = () => {
    const display = address ?? `${center.latitude.toFixed(5)}, ${center.longitude.toFixed(5)}`;
    navigation.navigate('Checkout', {
      ...route.params,
      latitude: center.latitude,
      longitude: center.longitude,
      address: display,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <View style={styles.mapWrap}>
        <Map
          style={styles.map}
          mapStyle={MAP_STYLE_URL}
          onRegionDidChange={handleRegionDidChange}
          touchRotate={false}
          touchPitch={false}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{ center: [DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.latitude], zoom: 14 }}
            minZoom={3}
            maxZoom={19}
          />
        </Map>

        {locating && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Finding your location…</Text>
          </View>
        )}
      </View>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Delivery Location</Text>
        <View style={styles.backBtn} />
      </View>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search area, road or landmark"
          placeholderTextColor={Colors.gray}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {searching ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <TouchableOpacity onPress={handleSearch} activeOpacity={0.7}>
            <Ionicons name="arrow-forward-circle" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Search results ──────────────────────────────────────────────── */}
      {results.length > 0 && (
        <View style={styles.resultsCard}>
          {results.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={styles.resultRow}
              onPress={() => handleSelectResult(r)}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={16} color={Colors.primary} />
              <Text style={styles.resultText} numberOfLines={2}>
                {r.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Center pin ──────────────────────────────────────────────────── */}
      <View style={styles.pinWrap} pointerEvents="none">
        <Ionicons name="location" size={44} color={Colors.primary} />
        <View style={styles.pinTail} />
      </View>

      {/* ── My location button ──────────────────────────────────────────── */}
      <TouchableOpacity style={styles.locateBtn} onPress={handleMyLocation} activeOpacity={0.85}>
        <Ionicons name="navigate" size={22} color={Colors.primary} />
      </TouchableOpacity>

      {/* ── Bottom confirm card ─────────────────────────────────────────── */}
      <View style={styles.bottomCard}>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <Ionicons name="home-outline" size={18} color={Colors.primary} />
          </View>
          <View style={styles.addressTextWrap}>
            <Text style={styles.addressLabel}>
              {resolving ? 'Resolving address…' : 'Delivery Address'}
            </Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {address ?? 'Move the map to choose a delivery point'}
            </Text>
          </View>
          {resolving && <ActivityIndicator size="small" color={Colors.primary} />}
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, !address && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!address}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
          <Text style={styles.confirmText}>Confirm Delivery Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MapPickerScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  mapWrap: { ...StyleSheet.absoluteFillObject },
  map: { flex: 1 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    gap: 10,
  },
  loadingText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.black },

  searchBox: {
    position: 'absolute',
    top: 74,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.black, padding: 0 },

  resultsCard: {
    position: 'absolute',
    top: 130,
    left: 16,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultText: { flex: 1, fontSize: 13, color: Colors.black, fontWeight: '500' },

  pinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -22,
    marginTop: -44,
    alignItems: 'center',
  },
  pinTail: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
  },

  locateBtn: {
    position: 'absolute',
    right: 16,
    bottom: 190,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTextWrap: { flex: 1, gap: 2 },
  addressLabel: { fontSize: 11, color: Colors.gray, fontWeight: '700', textTransform: 'uppercase' },
  addressText: { fontSize: 14, color: Colors.black, fontWeight: '600', lineHeight: 19 },

  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
});