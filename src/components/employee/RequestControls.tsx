import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RequestType = 'Material' | 'Issue' | 'Support';
export type Priority = 'Low' | 'Medium' | 'High';

const REQUEST_TYPES: RequestType[] = ['Material', 'Issue', 'Support'];

interface RequestTypePickerProps {
  selected: RequestType;
  onSelect: (type: RequestType) => void;
}

interface PrioritySelectorProps {
  selected: Priority;
  onSelect: (priority: Priority) => void;
}

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string }> = {
  Low: { color: Colors.success, bg: '#DCFCE7' },
  Medium: { color: Colors.warning, bg: '#FEF9C3' },
  High: { color: Colors.danger, bg: '#FEE2E2' },
};

// ─── RequestTypePicker ────────────────────────────────────────────────────────

export const RequestTypePicker: React.FC<RequestTypePickerProps> = ({ selected, onSelect }) => (
  <View>
    <Text style={styles.label}>Request Type</Text>
    <View style={styles.segmentContainer}>
      {REQUEST_TYPES.map((type, index) => {
        const isActive = selected === type;
        const isLast = index === REQUEST_TYPES.length - 1;
        return (
          <TouchableOpacity
            key={type}
            activeOpacity={0.75}
            onPress={() => onSelect(type)}
            style={[
              styles.segment,
              isActive && styles.segmentActive,
              !isLast && styles.segmentBorder,
            ]}
          >
            <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
              {type}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ─── PrioritySelector ─────────────────────────────────────────────────────────

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ selected, onSelect }) => (
  <View>
    <Text style={styles.label}>Priority</Text>
    <View style={styles.priorityRow}>
      {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
        const isActive = selected === p;
        const { color, bg } = PRIORITY_CONFIG[p];
        return (
          <TouchableOpacity
            key={p}
            activeOpacity={0.75}
            onPress={() => onSelect(p)}
            style={[
              styles.priorityChip,
              { borderColor: color },
              isActive && { backgroundColor: color },
            ]}
          >
            <Text style={[styles.priorityLabel, { color: isActive ? Colors.surface : color }]}>
              {p}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.btn,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  segmentBorder: {
    borderRightWidth: 1.5,
    borderRightColor: Colors.primary,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  segmentLabelActive: {
    color: Colors.surface,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
  },
  priorityLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
});
