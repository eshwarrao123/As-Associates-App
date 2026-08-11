import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkStage =
  | 'Foundation'
  | 'Civil'
  | 'Electrical'
  | 'Plumbing'
  | 'Finishing'
  | 'Handover';

export const WORK_STAGES: WorkStage[] = [
  'Foundation', 'Civil', 'Electrical', 'Plumbing', 'Finishing', 'Handover',
];

interface WorkStagePickerProps {
  selected: WorkStage;
  onSelect: (stage: WorkStage) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const WorkStagePicker: React.FC<WorkStagePickerProps> = ({ selected, onSelect }) => {
  return (
    <View>
      <Text style={styles.label}>Work Stage</Text>
      <View style={styles.container}>
        {WORK_STAGES.map((stage, index) => {
          const isActive = selected === stage;
          const isFirst = index === 0;
          const isLast = index === WORK_STAGES.length - 1;
          return (
            <TouchableOpacity
              key={stage}
              activeOpacity={0.75}
              onPress={() => onSelect(stage)}
              style={[
                styles.segment,
                isActive && styles.segmentActive,
                isFirst && styles.segmentFirst,
                isLast && styles.segmentLast,
              ]}
            >
              <Text
                style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}
                numberOfLines={1}
              >
                {stage}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  container: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.btn,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.primary,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentFirst: {
    // inherits border radius from container overflow
  },
  segmentLast: {
    borderRightWidth: 0,
  },
  segmentLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.2,
  },
  segmentLabelActive: {
    color: Colors.surface,
  },
});
