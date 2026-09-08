import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import { Icon } from '../../../src/components/ui/Icon';
import { ImageViewer } from '../../../src/components/ui/ImageViewer';
import { useAdminProject, useDeleteProject, useUpdateProject } from '../../../src/hooks/useAdminProjects';
import { useAdminProgressLogs } from '../../../src/hooks/useProgressLogs';
import { useAdminProjectUploads } from '../../../src/hooks/useAdminProjectUploads';
import { getErrorMessage } from '../../../src/services/api/errorHandler';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
  withAlpha,
} from '../../../src/constants/tokens';
import type { BadgeVariant } from '../../../src/types';

// ─── Types & Helpers ──────────────────────────────────────────────────────────

const TABS = ['Overview', 'Team', 'Photos', 'Progress', 'Requests'] as const;
type Tab = (typeof TABS)[number];

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusLabel(variant: BadgeVariant): string {
  switch (variant) {
    case 'ongoing':
      return 'Ongoing';
    case 'completed':
      return 'Completed';
    case 'onhold':
      return 'On Hold';
    default:
      return 'Unknown';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectDetailScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('Overview');
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const { data: project, isLoading, error } = useAdminProject(id ?? '');
  const { data: progressLogs, isLoading: isLoadingProgress } = useAdminProgressLogs(id);
  const { data: uploads, isLoading: isLoadingUploads } = useAdminProjectUploads(id ?? '');
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();

  const handleDelete = () => {
    Alert.alert('Delete Project', 'This cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProject.mutate(id ?? '', {
            onSuccess: () => {
              router.replace('/(admin)/projects');
            },
            onError: (err) => {
              Alert.alert('Error', getErrorMessage(err));
            },
          });
        },
      },
    ]);
  };

  const handleProgressEdit = () => {
    setProgressInput(String(project?.progress ?? 0));
    setEditingProgress(true);
  };

  const handleProgressSave = () => {
    const value = parseInt(progressInput, 10);
    if (isNaN(value) || value < 0 || value > 100) {
      Alert.alert('Invalid Input', 'Progress must be between 0 and 100.');
      return;
    }

    updateProject.mutate(
      { id: id ?? '', data: { progressPercent: value } },
      {
        onSuccess: () => {
          setEditingProgress(false);
        },
        onError: (err) => {
          Alert.alert('Error', getErrorMessage(err));
        },
      },
    );
  };

  const handleProgressCancel = () => {
    setEditingProgress(false);
    setProgressInput('');
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.loading}>
            <Text style={styles.errorText}>Failed to load project</Text>
            <Button label="Go Back" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  const OVERVIEW_META = [
    { label: 'Client', value: project.client },
    { label: 'Location', value: project.location },
    { label: 'Start Date', value: formatDate(project.startDate) },
    { label: 'End Date', value: project.targetEnd && project.targetEnd !== 'Not set' ? formatDate(project.targetEnd) : 'Not set' },
    { label: 'Scope', value: project.scope },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — navy, flat, with inline progress */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
              <Text style={styles.back}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{project.name}</Text>
            <Badge variant={project.status} label={getStatusLabel(project.status)} />
          </View>
          <View style={styles.headerProgressRow}>
            <ProgressBar
              value={project.progress}
              showLabel={false}
              style={styles.flex1}
              trackColor="rgba(255,255,255,0.2)"
              fillColor={Colors.accent}
            />
            <Text style={styles.headerPct}>{project.progress}%</Text>
          </View>
        </View>

        {/* Horizontal scrolling tabs — active = navy per DESIGN.md §10 */}
        <View style={styles.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {TABS.map((t) => {
              const active = tab === t;
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.7}
                  onPress={() => setTab(t)}
                  style={[styles.tab, active && styles.tabActive]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {tab === 'Overview' && (
            <>
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>PROJECT INFO</Text>
                {OVERVIEW_META.map((m, i) => (
                  <View
                    key={m.label}
                    style={[styles.metaRow, i < OVERVIEW_META.length - 1 && styles.metaBorder]}
                  >
                    <Text style={styles.metaLabel}>{m.label}</Text>
                    <Text style={styles.metaValue}>{m.value}</Text>
                  </View>
                ))}
              </Card>

              {/* Services Required section */}
              {(project.services && project.services.length > 0) || project.customService ? (
                <Card style={styles.section}>
                  <Text style={styles.sectionLabel}>SERVICES REQUIRED</Text>
                  <View style={styles.chipWrap}>
                    {project.services?.map((service) => (
                      <View key={service} style={styles.serviceChip}>
                        <Text style={styles.serviceChipText}>{service}</Text>
                      </View>
                    ))}
                    {project.customService && (
                      <View style={styles.serviceChip}>
                        <Text style={styles.serviceChipText}>{project.customService}</Text>
                      </View>
                    )}
                  </View>
                </Card>
              ) : null}

              <Card style={styles.section}>
                <View style={styles.progressEditHeader}>
                  <Text style={styles.sectionLabel}>PROJECT PROGRESS</Text>
                  {!editingProgress && (
                    <TouchableOpacity onPress={handleProgressEdit} hitSlop={8}>
                      <Icon name="edit" size="sm" color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.progressNote}>
                  Admin's assessment of overall physical project completion (0–100%).
                </Text>
                {editingProgress ? (
                  <View style={styles.progressEditRow}>
                    <TextInput
                      style={styles.progressInput}
                      value={progressInput}
                      onChangeText={setProgressInput}
                      keyboardType="number-pad"
                      placeholder="0-100"
                      maxLength={3}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={styles.progressSaveBtn}
                      onPress={handleProgressSave}
                      disabled={updateProject.isPending}
                    >
                      {updateProject.isPending ? (
                        <ActivityIndicator size="small" color={Colors.textOnPrimary} />
                      ) : (
                        <Text style={styles.progressSaveBtnText}>Save</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.progressCancelBtn}
                      onPress={handleProgressCancel}
                      disabled={updateProject.isPending}
                    >
                      <Text style={styles.progressCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.progressDisplayRow}>
                    <ProgressBar
                      value={project?.progress ?? 0}
                      showLabel={false}
                      style={styles.flex1}
                    />
                    <Text style={styles.progressPctLarge}>{project?.progress ?? 0}%</Text>
                  </View>
                )}
              </Card>

              <Button
                label="Delete Project"
                variant="outline"
                onPress={handleDelete}
                disabled={deleteProject.isPending}
              />
            </>
          )}

          {tab === 'Team' && (
            <Card style={styles.section}>
              <Text style={styles.sectionLabel}>ASSIGNED TEAM</Text>
              {project.team && project.team.length > 0 ? (
                project.team.map((m, i) => {
                  const initials = `${m.firstName[0]}${m.lastName[0]}`.toUpperCase();
                  return (
                    <View
                      key={m.id}
                      style={[styles.teamRow, i < project.team!.length - 1 && styles.metaBorder]}
                    >
                      <Avatar initials={initials} size="sm" />
                      <View style={styles.flex1}>
                        <Text style={styles.teamName}>{`${m.firstName} ${m.lastName}`}</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>No team members assigned yet</Text>
              )}
              <Button
                label="Assign Engineers"
                variant="outline"
                onPress={() => router.push(`/(admin)/projects/assign-engineers?projectId=${id}` as never)}
              />
            </Card>
          )}

          {tab === 'Photos' && (
            <Card style={styles.section}>
              <Text style={styles.sectionLabel}>SITE PHOTOS</Text>
              {isLoadingUploads ? (
                <View style={styles.progressLoadingRow}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : uploads && uploads.length > 0 ? (
                <View style={styles.photoGrid}>
                  {uploads.map((upload, index) => (
                    <TouchableOpacity
                      key={upload.id}
                      activeOpacity={0.7}
                      style={styles.photoThumb}
                      onPress={() => {
                        setSelectedPhotoIndex(index);
                        setViewerVisible(true);
                      }}
                    >
                      {upload.fileType === 'IMAGE' ? (
                        <Image
                          source={{ uri: upload.fileUrl }}
                          style={styles.photoImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.photoPlaceholder}>
                          <Icon name="site" size="xl" color={Colors.textMuted} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No photos uploaded for this project yet</Text>
              )}
            </Card>
          )}

          {tab === 'Progress' && (
            <Card style={styles.section}>
              <Text style={styles.sectionLabel}>DAILY PROGRESS LOGS</Text>
              {isLoadingProgress ? (
                <View style={styles.progressLoadingRow}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : progressLogs && progressLogs.length > 0 ? (
                progressLogs.slice(0, 10).map((log, i) => {
                  const logDate = new Date(log.date || log.createdAt);
                  const dateStr = logDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown';
                  return (
                    <View
                      key={log.id}
                      style={[styles.progressLogRow, i < Math.min(progressLogs.length, 10) - 1 && styles.metaBorder]}
                    >
                      <View style={styles.progressLogHeader}>
                        <Text style={styles.progressLogTitle} numberOfLines={1}>{log.title}</Text>
                        {log.workStage && (
                          <View style={styles.stageChip}>
                            <Text style={styles.stageChipText}>{log.workStage}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.progressLogDesc} numberOfLines={2}>{log.description}</Text>
                      <Text style={styles.progressLogMeta}>{userName} · {dateStr}</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>No progress logs submitted for this project yet.</Text>
              )}
            </Card>
          )}

          {tab === 'Requests' && (
            <Card style={styles.section}>
              <Text style={styles.sectionLabel}>PROJECT REQUESTS</Text>
              <Text style={styles.emptyText}>Project requests not yet available</Text>
            </Card>
          )}
        </ScrollView>

        <AdminBottomNav activeIndex={1} />
      </SafeAreaView>

      {/* Full-screen Image Viewer */}
      {uploads && uploads.length > 0 && (
        <ImageViewer
          visible={viewerVisible}
          images={uploads.map((upload) => ({ id: upload.id, url: upload.fileUrl }))}
          initialIndex={selectedPhotoIndex}
          onClose={() => setViewerVisible(false)}
        />
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing[4] },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing[3],
  },

  // Top app bar — 56px base height, navy, flat, extended with progress row
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  back: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textOnPrimary,
    lineHeight: 30,
  },
  // headline-sm: 18px / bold
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },
  headerProgressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  // label-sm: 12px / 500
  headerPct: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
    minWidth: 36,
    textAlign: 'right',
  },

  // Tab bar — active underline = navy (nav active color per DESIGN.md §10)
  tabBar: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabScroll: { paddingHorizontal: Spacing[2] },
  tab: {
    paddingHorizontal: Spacing[4],
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  // label-md: 14px / 500
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  tabTextActive: { color: Colors.primary },

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },
  section: { gap: Spacing[3] },

  // Overline: xs (11px) / medium / wider letter-spacing / muted
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },

  // Meta rows — body-md (14px) for both label and value
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing[3],
  },
  metaBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  metaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  metaValue: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  // Service chips — pill, navy tint bg
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  serviceChip: {
    backgroundColor: withAlpha(Colors.primary, 0.07),
    borderRadius: BorderRadius.badge,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  // label-sm: 12px / 500
  serviceChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },

  // Team list — list item pattern per DESIGN.md §14
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingBottom: Spacing[3],
  },
  // List item title — body-lg: 16px / 400 (medium for name emphasis)
  teamName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  // List item subtitle — body-md: 14px / 400
  teamRole: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },

  // Photo grid — 3 columns with aspect-ratio squares
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  photoThumb: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: BorderRadius.btn,
    backgroundColor: withAlpha(Colors.primary, 0.06),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: withAlpha(Colors.primary, 0.06),
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: { fontSize: 26 },
  // Progress stages
  stageRow: { gap: Spacing[2] },
  stageHead: { flexDirection: 'row', justifyContent: 'space-between' },
  // label-md: 14px / 500
  stageLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  // label-sm: 12px / 500
  stagePct: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  // Progress log rows
  progressLoadingRow: {
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  progressLogRow: {
    paddingBottom: Spacing[3],
    gap: Spacing[1],
  },
  progressLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  progressLogTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  stageChip: {
    backgroundColor: withAlpha(Colors.accent, 0.12),
    borderRadius: BorderRadius.badge,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
  },
  stageChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  progressLogDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  progressLogMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // Request rows
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingBottom: Spacing[3],
  },
  // List item title — body-lg: 16px
  reqTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  // List item subtitle — body-md: 14px
  reqBy: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },

  // Progress edit UI
  progressEditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  progressEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  progressInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    paddingHorizontal: Spacing[3],
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  progressSaveBtn: {
    height: 48,
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSaveBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
  },
  progressCancelBtn: {
    height: 48,
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCancelBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  progressDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  progressPctLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.primary,
    minWidth: 48,
    textAlign: 'right',
  },
});
