import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
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
import { useMyProjects } from '../../src/hooks/useMyProjects';
import { useCreateProgressLog } from '../../src/hooks/useProgressLogs';
import { getErrorMessage } from '../../src/services/api/errorHandler';

// ─── Mock data ────────────────────────────────────────────────────────────────

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

  // Fetch projects from API
  const { data: projects, isLoading: isLoadingProjects } = useMyProjects();
  const createProgressLog = useCreateProgressLog();

  // Form state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState('Foundation');
  const [workDone, setWorkDone] = useState('');

  // Set default project when projects load
  React.useEffect(() => {
    if (projects && projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  // Get today's date in ISO format (YYYY-MM-DD)
  const todayDate = new Date().toISOString().split('T')[0];

  // Format today's date for display (DD-MM-YYYY)
  const displayDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');

  // Convert projects to dropdown options
  const projectOptions = projects?.map((p) => ({
    label: `${p.name} - ${p.location}`,
    value: p.id,
  })) ?? [];

  const selectedProject = projectOptions.find((opt) => opt.value === projectId);

  // Handle form submission
  const handleSubmit = () => {
    if (!projectId) {
      Alert.alert('Error', 'Please select a project');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!workDone.trim()) {
      Alert.alert('Error', 'Please describe the work done');
      return;
    }

    createProgressLog.mutate(
      {
        projectId,
        title,
        description: workDone,
        workStage: stage,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Progress log submitted!');
          // Reset form
          setTitle('');
          setWorkDone('');
          setStage('Foundation');
        },
        onError: (error) => {
          Alert.alert('Error', getErrorMessage(error));
        },
      },
    );
  };

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
            {/* Date — shows today's date */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Date</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputValue}>{displayDate}</Text>
                <Icon
                  name="calendarOutline"
                  size="md"
                  color={Colors.textSecondary}
                />
              </View>
            </View>

            {/* Select Project */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Select Project</Text>
              {isLoadingProjects ? (
                <View style={[styles.inputBox, styles.loadingBox]}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : projectOptions.length === 0 ? (
                <View style={[styles.inputBox, styles.emptyBox]}>
                  <Text style={styles.emptyText}>No projects assigned</Text>
                </View>
              ) : (
                <Dropdown
                  label=""
                  placeholder="Choose a project..."
                  value={selectedProject?.label ?? null}
                  options={projectOptions.map((opt) => opt.label)}
                  onSelect={(label) => {
                    const selected = projectOptions.find((opt) => opt.label === label);
                    if (selected) setProjectId(selected.value);
                  }}
                  containerStyle={styles.dropdown}
                />
              )}
            </View>

            {/* Title */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                style={styles.inputBox}
                value={title}
                onChangeText={setTitle}
                placeholder="Brief summary of today's work..."
                placeholderTextColor={Colors.textMuted}
                editable={!createProgressLog.isPending}
              />
            </View>

            {/* Work Stage */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Work Stage (Optional)</Text>
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

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                value={workDone}
                onChangeText={setWorkDone}
                placeholder="Describe the tasks completed today..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
                editable={!createProgressLog.isPending}
              />
            </View>
          </Card>

          {/* ── Save ──────────────────────────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.saveBtn,
              createProgressLog.isPending && styles.saveBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createProgressLog.isPending}
          >
            {createProgressLog.isPending ? (
              <ActivityIndicator size="small" color={Colors.textOnAccent} />
            ) : (
              <>
                <Icon name="document" size="md" color={Colors.textOnAccent} />
                <Text style={styles.saveBtnText}>Save Progress</Text>
              </>
            )}
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
    height: InputHeight,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.background,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
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

  // ── Description textarea ────────────────────────────────────────────────────
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
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textOnAccent,
  },

  // ── Loading and empty states ─────────────────────────────────────────────────
  loadingBox: {
    justifyContent: 'center',
  },
  emptyBox: {
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
