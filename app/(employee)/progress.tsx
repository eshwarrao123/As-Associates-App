import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.store';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { Icon } from '../../src/components/ui/Icon';
import { BottomNav } from '../../src/components/ui/BottomNav';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  InputHeight,
  ButtonHeight,
} from '../../src/constants/tokens';

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
  const router = useRouter();
  const { user } = useAuthStore();
  const [project, setProject] = useState<string | null>(PROJECT_OPTIONS[0]);
  const [stage, setStage] = useState('Foundation');
  const [workDone, setWorkDone] = useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* ── App Bar ─────────────────────────────────────────────────────── */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Icon name="back" size="lg" color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Daily Progress</Text>
          <Avatar initials={user?.avatarInitials ?? 'U'} size="sm" />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Page Heading ──────────────────────────────────────────────── */}
          <View style={styles.pageHead}>
            <Text style={styles.pageTitle}>Daily Progress</Text>
            <Text style={styles.pageSubtitle}>
              Log your work details and hours for today.
            </Text>
          </View>

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <Card style={styles.formCard}>
            {/* Date — presentational; the screen holds no date state */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Date</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputValue}>05-08-2026</Text>
                <Icon
                  name="calendarOutline"
                  size="md"
                  color={Colors.textSecondary}
                />
              </View>
            </View>

            {/* Select Project */}
            <Dropdown
              label="Select Project"
              placeholder="Choose a project..."
              value={project}
              options={PROJECT_OPTIONS}
              onSelect={setProject}
              containerStyle={styles.dropdown}
            />

            {/* Work Stage */}
            <View style={styles.field}>
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
                      style={[
                        styles.chip,
                        active ? styles.chipActive : styles.chipInactive,
                      ]}
                    >
                      <Text
                        style={
                          active ? styles.chipTextActive : styles.chipTextInactive
                        }
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Work Done */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Work Done</Text>
              <TextInput
                style={styles.textArea}
                value={workDone}
                onChangeText={setWorkDone}
                placeholder="Describe the tasks completed today..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>
          </Card>

          {/* ── Save ──────────────────────────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.saveBtn}
            onPress={() => {}}
          >
            <Icon name="document" size="md" color={Colors.textOnAccent} />
            <Text style={styles.saveBtnText}>Save Progress</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // App bar — light surface per Stitch screen, title left-aligned beside the mark
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appBarTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.primaryDark,
  },

  content: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[8],
  },

  // ── Page heading ────────────────────────────────────────────────────────────
  pageHead: {
    paddingTop: Spacing[5],
    paddingBottom: Spacing[4],
    gap: Spacing[1],
  },
  pageTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    lineHeight: 38,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.textMuted,
  },

  // ── Form card ───────────────────────────────────────────────────────────────
  formCard: { gap: Spacing[5] },
  field: { gap: Spacing[2] },
  fieldLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.textPrimary,
  },

  // Filled input treatment — background-tinted fill on the white card
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: InputHeight,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.background,
  },
  inputValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  dropdown: { marginBottom: 0 },

  // ── Work stage chips ────────────────────────────────────────────────────────
  chipRow: { gap: Spacing[2], paddingRight: Spacing[4] },
  chip: {
    height: 32,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.primary },
  chipInactive: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipTextActive: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
  },
  chipTextInactive: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ── Work done ───────────────────────────────────────────────────────────────
  textArea: {
    height: 96,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.background,
    padding: 14,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  // ── Hours stepper ───────────────────────────────────────────────────────────
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: InputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xl,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  stepDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
  stepValueBox: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  hoursSuffix: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },

  // ── Save button — accent primary, with leading icon ──────────────────────────
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    height: ButtonHeight,
    marginTop: Spacing[6],
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.accent,
  },
  saveBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textOnAccent,
  },
});
