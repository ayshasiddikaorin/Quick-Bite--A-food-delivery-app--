import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OfferItem } from '../data/dummyData';
import Colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.78;

interface Props {
  item: OfferItem;
  fullWidth?: boolean;
}

const OfferCard: React.FC<Props> = ({ item, fullWidth = false }) => {
  return (
    <TouchableOpacity
      style={[styles.card, fullWidth && styles.cardFullWidth]}
      activeOpacity={0.9}
    >
      {/* Background Image */}
      <Image source={{ uri: item.image }} style={styles.bgImage} />

      {/* Dark Gradient Overlay */}
      <View style={styles.overlay} />

      {/* Discount Badge */}
      <View style={styles.discountBadge}>
        <Text style={styles.discountValue}>{item.discount}%</Text>
        <Text style={styles.discountLabel}>OFF</Text>
      </View>

      {/* Valid Tag */}
      <View style={styles.validTag}>
        <Ionicons name="time-outline" size={10} color={Colors.white} />
        <Text style={styles.validText}>{item.validUntil}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <TouchableOpacity style={styles.orderBtn} activeOpacity={0.8}>
          <Text style={styles.orderBtnText}>Order Now</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 165,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 14,
    position: 'relative',
  },
  cardFullWidth: {
    width: '100%',
    marginRight: 0,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  discountBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  discountValue: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  discountLabel: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  validTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  validText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 3,
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  orderBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default OfferCard;
