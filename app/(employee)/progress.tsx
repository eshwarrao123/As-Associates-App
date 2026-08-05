import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

const PROJECT_OPTIONS = [
  'ICICI Bank HQ - Andheri',
  'Axis Bank - Bandra',
  'HDFC Bank - Powai',
];

const WORK_STAGES = [
  'Foundation',
  'Civil',
  'Electrical',
  'Plumbing',
  'Finishing',
  'Handover',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgressScreen(): React.ReactElement {
  const [project, setProject] = useState<string | null>(PROJECT_OPTIONS[0]);
  const [stage, setStage] = useState('Foundation');
  const [workDone, setWorkDone] = useState('');
  const [hours, setHours] = useState(8);

  const adjustHours = (delta: number) =>
    setHours((prev) => Math.max(0, Math.min(24, +(prev + delta).toFixed(1))));

  return (
    <>
      <Stack.Screen options={{ title: 'Daily Progress' }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Details */}
          <Card style={styles.section}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Today</Text>
              <Text style={styles.dateValue}>20 July 2026</Text>
            </View>

            <Dropdown
              label="Select Project"
              placeholder="Choose a project"
              value={project}
              options={PROJECT_OPTIONS}
              onSelect={setProject}
            />

            <View>
              <Text style={styles.fieldLabel}>Work Stage</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {WORK_STAGES.map((s) => {
                  const active = stage === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      activeOpacity={0.7}
                      onPress={() => setStage(s)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    >
                      <Text style={active ? styles.chipTextActive : styles.chipTextInactive}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </Card>

          {/* Work Details */}
          <Card style={styles.section}>
            <Text style={styles.blockLabel}>Work Done Today</Text>
            <TextInput
              style={styles.textArea}
              value={workDone}
              onChangeText={setWorkDone}
              placeholder="Describe the tasks completed today..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.blockLabel}>Hours Worked</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.stepBtn}
                onPress={() => adjustHours(-0.5)}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.hoursValue}>{hours.toFixed(1)}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.stepBtn}
                onPress={() => adjustHours(0.5)}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Attachments */}
          <Card style={styles.section}>
            <Text style={styles.blockLabel}>Attachments (Optional)</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.dropzone}>
              <Text style={styles.dropzoneIcon}>📷</Text>
              <Text style={styles.dropzoneText}>Tap to upload photo</Text>
            </TouchableOpacity>
          </Card>

          <Button label="Save Progress" onPress={() => {}} />
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },
  section: { gap: Spacing[3] },

  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary },
  dateValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  chipRow: { gap: Spacing[2], paddingRight: Spacing[2] },
  chip: {
    height: 32,
    borderRadius: BorderRadius.btn,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.primary },
  chipInactive: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipTextActive: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.surface },
  chipTextInactive: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },

  blockLabel: { fontFamily: FontFamily.bold, fontSize: 13, color: Colors.textPrimary },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
    padding: 14,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[5] },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontFamily: FontFamily.bold, fontSize: 20, color: Colors.primary, lineHeight: 22 },
  hoursValue: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, minWidth: 44, textAlign: 'center' },

  dropzone: {
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dropzoneIcon: { fontSize: 22 },
  dropzoneText: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },
});
