import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkCategory =
  | 'Civil'
  | 'Electrical'
  | 'Painting'
  | 'HVAC'
  | 'Plumbing'
  | 'False Ceiling'
  | 'Furniture'
  | 'Signage';

export const WORK_CATEGORIES: WorkCategory[] = [
  'Civil', 'Electrical', 'Painting', 'HVAC',
  'Plumbing', 'False Ceiling', 'Furniture', 'Signage',
];

interface CategoryPickerProps {
  selected: WorkCategory | null;
  onSelect: (category: WorkCategory) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CategoryPicker: React.FC<CategoryPickerProps> = ({ selected, onSelect }) => {
  return (
    <View>
      <Text style={styles.label}>Work Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {WORK_CATEGORIES.map((cat) => {
          const isActive = selected === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.7}
              onPress={() => onSelect(cat)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  scroll: {
    gap: Spacing[2],
    paddingRight: Spacing[4],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
    borderRadius: BorderRadius.badge,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chipLabelActive: {
    color: Colors.surface,
  },
});
