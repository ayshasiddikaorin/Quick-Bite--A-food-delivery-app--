import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useNotifications } from '../../context/NotificationContext';
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
 * - If the backend is offline the picked photo is kept as a LOCAL preview only
 *   (never saved into the form value), and the user is told to use the URL
 *   field instead.
 */
const ImagePickField: React.FC<Props> = ({ value, onChange, loadingColor = Colors.sellerAccent }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const { showPopup } = useNotifications();

  // When the committed value changes externally (typed URL, cleared, edited
  // item load), drop any un-committed local preview so it never overrides it.
  useEffect(() => {
    setPreviewUri(null);
  }, [value]);

  const requestPermission = async (): Promise<boolean> => {
    const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (perm.granted) return true;
    const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return req.granted;
  };

  const pickImage = async () => {
    const granted = await requestPermission();
    if (!granted) {
      showPopup({
        title: 'Permission Needed',
        message: 'Allow photo access to upload a food image, or paste a URL in the field below.',
        variant: 'warning',
      });
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
      showPopup({ title: 'Could Not Read Image', message: 'Please try a different photo.', variant: 'error' });
      return;
    }

    const dataUri = `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
    setUploading(true);
    try {
      const url = await uploadImageBase64(dataUri);
      onChange(url);
      setPreviewUri(url);
    } catch {
      // Backend unreachable — show the local preview only; the form value is
      // left untouched so a huge base64 blob is never persisted.
      setPreviewUri(dataUri);
      showPopup({
        title: 'Upload Unavailable',
        message: 'Could not reach the server, so this photo was not uploaded. Paste an image URL below instead.',
        variant: 'warning',
        autoDismissMs: 4000,
      });
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => onChange('');

  const displayUri = previewUri ?? value;

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
        {displayUri ? (
          <Image source={{ uri: safeImageUri(displayUri) }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderInner}>
            <Ionicons name="image-outline" size={40} color={Colors.sellerAccent} />
            <Text style={styles.uploadText}>Tap to choose a photo</Text>
            <Text style={styles.uploadSub}>JPG, PNG, WEBP • Max 10MB</Text>
          </View>
        )}
      </TouchableOpacity>

      {displayUri !== '' && (
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