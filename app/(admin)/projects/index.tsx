import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '../../../src/constants/tokens';
import type { BadgeVariant } from '../../../src/types';

// ─── Types & mock data ────────────────────────────────────────────────────────

type ProjectStatus = 'ongoing' | 'completed' | 'onhold';

interface AdminProject {
  id: string;
  name: string;
  client: string;
  city: string;
  status: ProjectStatus;
  progress: number;
  engineers: string[];
}

const PROJECTS: AdminProject[] = [
  { id: '1', name: 'ICICI Bank HQ - Andheri', client: 'ICICI Bank', city: 'Mumbai', status: 'ongoing', progress: 65, engineers: ['RK', 'AS', 'VP'] },
  { id: '2', name: 'Axis Bank - Bandra', client: 'Axis Bank', city: 'Mumbai', status: 'ongoing', progress: 40, engineers: ['PJ', 'MR'] },
  { id: '3', name: 'HDFC Bank - Powai', client: 'HDFC Bank', city: 'Mumbai', status: 'completed', progress: 100, engineers: ['RK'] },
  { id: '4', name: 'Tech Park Phase 1', client: 'Commercial', city: 'Pune', status: 'onhold', progress: 30, engineers: ['AS', 'VP'] },
  { id: '5', name: 'Lodha Allumount', client: 'Residential', city: 'Mumbai', status: 'completed', progress: 100, engineers: ['PJ'] },
];

const STATUS_BADGE: Record<ProjectStatus, { variant: BadgeVariant; label: string }> = {
  ongoing: { variant: 'ongoing', label: 'Ongoing' },
  completed: { variant: 'completed', label: 'Completed' },
  onhold: { variant: 'onhold', label: 'On Hold' },
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type Filter = 'All' | 'Ongoing' | 'Completed' | 'Upcoming';
const FILTERS: Filter[] = ['All', 'Ongoing', 'Completed', 'Upcoming'];
const FILTER_STATUS: Record<Exclude<Filter, 'All'>, ProjectStatus> = {
  Ongoing: 'ongoing',
  Completed: 'completed',
  Upcoming: 'upcoming',
};

// ─── Avatar stack ─────────────────────────────────────────────────────────────

const AvatarStack: React.FC<{ initials: string[] }> = ({ initials }) => (
  <View style={styles.avatarStack}>
    {initials.map((ini, i) => (
      <Avatar
        key={i}
        initials={ini}
        size="sm"
        style={StyleSheet.flatten([styles.stackAvatar, i > 0 && styles.stackOverlap])}
      />
    ))}
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminProjectsScreen(): React.ReactElement {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('All');

  const filtered =
    filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.status === FILTER_STATUS[filter]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Projects</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addBtn}
            onPress={() => router.push('/(admin)/projects/new' as never)}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.7}
                onPress={() => setFilter(f)}
                style={[styles.filterTab, active && styles.filterTabActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <Card style={styles.projectCard}>
              <View style={styles.cardRow1}>
                <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
                <Badge {...STATUS_BADGE[item.status]} />
              </View>
              <View style={styles.cardRow2}>
                <Text style={styles.meta}>{item.client}</Text>
                <Text style={styles.meta}>{item.city}</Text>
              </View>
              <View style={styles.cardRow3}>
                <ProgressBar value={item.progress} showLabel={false} style={styles.flex1} />
                <Text style={styles.pct}>{item.progress}%</Text>
              </View>
              <View style={styles.cardRow4}>
                <AvatarStack initials={item.engineers} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push(`/(admin)/projects/${item.id}` as never)}
                >
                  <Text style={styles.viewDetails}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />

        <AdminBottomNav activeIndex={1} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },

  // Top app bar — 56px, navy, flat (no shadow per DESIGN.md §11)
  header: {
    backgroundColor: Colors.primary,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
  },
  // headline-sm: 18px / 600 — Inter_700Bold is the closest available weight
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },
  // Primary amber button — 8px radius, label-md (14px/500)
  addBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.accent,
  },
  addBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textOnAccent,
  },

  // Filter tabs — active indicator is navy (nav active = #1A3C5E per DESIGN.md §10)
  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: { borderBottomColor: Colors.primary },
  // label-md: 14px / 500
  filterText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  filterTextActive: { color: Colors.primary },

  // 16px outer padding, 12px between cards (DESIGN.md §3 grid)
  list: { padding: Spacing[4] },
  sep: { height: Spacing[3] },

  // Default content card — no left border accent (not in DESIGN.md §8 project card spec)
  projectCard: { gap: Spacing[2] },
  cardRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  // headline-sm: 18px / 600
  projectName: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  cardRow2: { flexDirection: 'row', justifyContent: 'space-between' },
  // body-md: 14px / 400
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  cardRow3: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  // label-sm: 12px / 500 — percentage label right of progress bar
  pct: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.primary,
    minWidth: 36,
    textAlign: 'right',
  },
  cardRow4: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing[1],
  },
  // Ghost inline action — navy per DESIGN.md §6 ghost button spec
  viewDetails: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.primary,
  },

  avatarStack: { flexDirection: 'row' },
  stackAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  stackOverlap: { marginLeft: -8 },
});
