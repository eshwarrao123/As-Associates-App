import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import { Icon } from '../../../src/components/ui/Icon';
import { useAdminProject, useDeleteProject } from '../../../src/hooks/useAdminProjects';
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

  const { data: project, isLoading, error } = useAdminProject(id ?? '');
  const deleteProject = useDeleteProject();

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
    { label: 'End Date', value: project.endDate ? formatDate(project.endDate) : 'Not set' },
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
                onPress={() => router.push(`/(admin)/projects/assign-engineers` as never)}
              />
            </Card>
          )}

          {tab === 'Photos' && (
            <Card style={styles.section}>
              <Text style={styles.sectionLabel}>SITE PHOTOS</Text>
              <View style={styles.photoGrid}>
                {Array.from({ length: 6 }, (_, i) => (
                  <View key={i} style={styles.photoThumb}>
                    <Icon name="site" size="xl" color={Colors.textMuted} />
                  </View>
                ))}
              </View>
            </Card>
          )}

          {tab === 'Progress' && (
            <Card style={styles.section}>
              <Text style={styles.sectionLabel}>STAGE PROGRESS</Text>
              <Text style={styles.emptyText}>Stage progress data not yet available</Text>
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
});
