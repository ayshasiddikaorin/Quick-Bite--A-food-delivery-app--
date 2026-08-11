import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

export type PopupVariant = 'success' | 'error' | 'warning' | 'info';

export interface PopupModalProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: PopupVariant;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  autoDismissMs?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const VARIANT_CONFIG: Record<
  PopupVariant,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  success: {
    icon: 'checkmark-circle-outline',
    color: '#00A699',
    bg: '#E6F7F5',
  },
  error: {
    icon: 'alert-circle-outline',
    color: '#FF5A5F',
    bg: '#FFEBEB',
  },
  warning: {
    icon: 'warning-outline',
    color: '#F7941D',
    bg: '#FFF8E1',
  },
  info: {
    icon: 'information-circle-outline',
    color: '#6C5CE7',
    bg: '#F0EEFF',
  },
};

export const PopupModal: React.FC<PopupModalProps> = ({
  visible,
  title,
  message,
  variant = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  autoDismissMs,
  onConfirm,
  onCancel,
}) => {
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;

  useEffect(() => {
    if (visible && autoDismissMs && autoDismissMs > 0) {
      const timer = setTimeout(() => {
        if (onConfirm) onConfirm();
        else if (onCancel) onCancel();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [visible, autoDismissMs, onConfirm, onCancel]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
      statusBarTranslucent
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Top Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={36} color={cfg.color} />
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            {showCancel && onCancel && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: cfg.color },
                !showCancel && { flex: 1 },
              ]}
              onPress={onConfirm || onCancel}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PopupModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkGray,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
});
