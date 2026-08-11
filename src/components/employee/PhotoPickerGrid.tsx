import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickedPhoto {
  uri: string;
  id: string;
}

interface PhotoPickerGridProps {
  photos: PickedPhoto[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  maxPhotos?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PhotoPickerGrid: React.FC<PhotoPickerGridProps> = ({
  photos,
  onAdd,
  onRemove,
  maxPhotos = 6,
}) => {
  const canAdd = photos.length < maxPhotos;

  return (
    <View>
      <Text style={styles.label}>Photos ({photos.length}/{maxPhotos})</Text>
      <View style={styles.grid}>
        {/* Existing photos */}
        {photos.map((photo) => (
          <View key={photo.id} style={styles.thumb}>
            <Image source={{ uri: photo.uri }} style={styles.thumbImage} />
            <TouchableOpacity
              onPress={() => onRemove(photo.id)}
              style={styles.removeBtn}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add button */}
        {canAdd && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onAdd}
            style={styles.addBtn}
          >
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addLabel}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL_SIZE = 96;

const styles = StyleSheet.create({
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  thumb: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: BorderRadius.btn,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: Colors.surface,
    fontSize: 10,
    fontFamily: FontFamily.bold,
    lineHeight: 12,
  },
  addBtn: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: BorderRadius.btn,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addIcon: {
    fontSize: 24,
    color: Colors.primary,
    fontFamily: FontFamily.regular,
    lineHeight: 28,
  },
  addLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
