import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import { Icon } from '../../../src/components/ui/Icon';
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

// ─── Mock data ────────────────────────────────────────────────────────────────

interface ProjectDetail {
  name: string;
  client: string;
  city: string;
  status: BadgeVariant;
  statusLabel: string;
  progress: number;
  startDate: string;
  endDate: string;
  budget: string;
}

const PROJECT: ProjectDetail = {
  name: 'ICICI Bank HQ - Andheri',
  client: 'ICICI Bank',
  city: 'Mumbai',
  status: 'ongoing',
  statusLabel: 'Ongoing',
  progress: 65,
  startDate: '10 Mar 2026',
  endDate: '30 Sep 2026',
  budget: '₹2.4 Cr',
};

const TABS = ['Overview', 'Team', 'Photos', 'Progress', 'Requests'] as const;
type Tab = (typeof TABS)[number];

const OVERVIEW_META = [
  { label: 'Client', value: PROJECT.client },
  { label: 'Location', value: PROJECT.city },
  { label: 'Start Date', value: PROJECT.startDate },
  { label: 'End Date', value: PROJECT.endDate },
  { label: 'Budget', value: PROJECT.budget },
];

const SERVICES = ['Civil', 'Electrical', 'HVAC', 'False Ceiling', 'Furniture'];

const TEAM = [
  { id: 't1', name: 'Rahul Kumar', initials: 'RK', role: 'Site Engineer' },
  { id: 't2', name: 'Anita Sharma', initials: 'AS', role: 'Civil Engineer' },
  { id: 't3', name: 'Vikram Patel', initials: 'VP', role: 'Electrical Engineer' },
];

const PROGRESS_STAGES = [
  { label: 'Foundation', value: 100 },
  { label: 'Civil Works', value: 80 },
  { label: 'Electrical', value: 55 },
  { label: 'Finishing', value: 20 },
];

interface DetailRequest {
  id: string;
  title: string;
  by: string;
  status: BadgeVariant;
}

const REQUESTS: DetailRequest[] = [
  { id: 'q1', title: 'Cement Bags x50', by: 'Rahul Kumar', status: 'pending' },
  { id: 'q2', title: 'Extra scaffolding', by: 'Anita Sharma', status: 'approved' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectDetailScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('Overview');

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
            <Text style={styles.headerTitle} numberOfLines={1}>{PROJECT.name}</Text>
            <Badge variant={PROJECT.status} label={PROJECT.statusLabel} />
          </View>
          <View style={styles.headerProgressRow}>
            <ProgressBar
              value={PROJECT.progress}
              showLabel={false}
              style={styles.flex1}
              trackColor="rgba(255,255,255,0.2)"
              fillColor={Colors.accent}
            />
            <Text style={styles.headerPct}>{PROJECT.progress}%</Text>
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
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>SERVICES</Text>
                <View style={styles.chipWrap}>
                  {SERVICES.map((s) => (
                    <View key={s} style={styles.serviceChip}>
                      <Text style={styles.serviceChipText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </>
          )}

          {tab === 'Team' && (
            <Card style={styles.section}>
              <Text style={styles.sectionLabel}>ASSIGNED TEAM</Text>
              {TEAM.map((m, i) => (
                <View
                  key={m.id}
                  style={[styles.teamRow, i < TEAM.length - 1 && styles.metaBorder]}
                >
                  <Avatar initials={m.initials} size="sm" />
                  <View style={styles.flex1}>
                    <Text style={styles.teamName}>{m.name}</Text>
                    <Text style={styles.teamRole}>{m.role}</Text>
                  </View>
                </View>
              ))}
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
              {PROGRESS_STAGES.map((s) => (
                <View key={s.label} style={styles.stageRow}>
                  <View style={styles.stageHead}>
                    <Text style={styles.stageLabel}>{s.label}</Text>
                    <Text style={styles.stagePct}>{s.value}%</Text>
                  </View>
                  <ProgressBar value={s.value} showLabel={false} />
                </View>
              ))}
            </Card>
          )}

          {tab === 'Requests' && (
            <Card style={styles.section}>
              <Text style={styles.sectionLabel}>PROJECT REQUESTS</Text>
              {REQUESTS.map((r, i) => (
                <View
                  key={r.id}
                  style={[styles.reqRow, i < REQUESTS.length - 1 && styles.metaBorder]}
                >
                  <View style={styles.flex1}>
                    <Text style={styles.reqTitle}>{r.title}</Text>
                    <Text style={styles.reqBy}>by {r.by}</Text>
                  </View>
                  <Badge variant={r.status} />
                </View>
              ))}
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
