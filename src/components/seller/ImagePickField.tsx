import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { uploadImageBase64 } from '../../services/uploadService';
import { safeImageUri } from '../../utils/image';

interface Props {
  value: string;            // current image url (may be empty)
  onChange: (url: string) => void;
  loadingColor?: string;
}

/**
 * Image picker for seller add/edit forms.
 * - Tapping the preview opens the gallery, uploads the picked file to the
 *   backend and resolves to a URL.
 * - If the backend is offline the raw image is kept so the preview still
 *   works, and the user is told to use the URL field instead.
 */
const ImagePickField: React.FC<Props> = ({ value, onChange, loadingColor = Colors.sellerAccent }) => {
  const [uploading, setUploading] = useState(false);

  const requestPermission = async (): Promise<boolean> => {
    const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (perm.granted) return true;
    const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return req.granted;
  };

  const pickImage = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload a food photo, or paste an image URL below.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.base64) {
      Alert.alert('Could not read image', 'Please try another photo.');
      return;
    }

    const dataUri = `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
    setUploading(true);
    try {
      const url = await uploadImageBase64(dataUri);
      onChange(url);
    } catch {
      // Backend unreachable — keep the local preview, flag that it is a data URI.
      onChange(dataUri);
      Alert.alert(
        'Offline upload',
        'Backend is in dummy-data mode, so the photo could not be saved to the server. Paste an image URL instead.',
      );
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => onChange('');

  if (uploading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="large" color={loadingColor} />
        <Text style={styles.uploadingText}>Uploading photo…</Text>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.85}>
        {value ? (
          <Image source={{ uri: safeImageUri(value) }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderInner}>
            <Ionicons name="image-outline" size={40} color={Colors.sellerAccent} />
            <Text style={styles.uploadText}>Tap to choose a photo</Text>
            <Text style={styles.uploadSub}>JPG, PNG, WEBP • Max 10MB</Text>
          </View>
        )}
      </TouchableOpacity>

      {value !== '' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.changeBtn} onPress={pickImage} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={15} color={Colors.sellerAccent} />
            <Text style={styles.changeText}>Change photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={clearImage} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={15} color={Colors.error} />
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ImagePickField;

const styles = StyleSheet.create({
  uploadBox: {
    backgroundColor: Colors.successLight,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.sellerAccent,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: 160,
    marginBottom: 12,
  },
  placeholder: {
    backgroundColor: Colors.successLight,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.sellerAccent,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    marginBottom: 12,
    gap: 10,
  },
  uploadingText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  placeholderInner: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  preview: { width: '100%', height: 180 },
  uploadText: { fontSize: 15, fontWeight: '700', color: Colors.sellerAccent },
  uploadSub: { fontSize: 12, color: Colors.gray },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  changeBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.successLight,
  },
  changeText: { fontSize: 13, fontWeight: '700', color: Colors.sellerAccent },
  removeBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.errorLight,
  },
  removeText: { fontSize: 13, fontWeight: '700', color: Colors.error },
});