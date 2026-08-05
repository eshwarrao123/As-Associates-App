import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import { Colors, FontFamily, FontSize, Spacing } from '../../../src/constants/tokens';
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

const STATUS_BORDER: Record<ProjectStatus, string> = {
  ongoing: Colors.accent,
  completed: Colors.success,
  onhold: '#9CA3AF',
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type Filter = 'All' | 'Ongoing' | 'Completed' | 'On Hold';
const FILTERS: Filter[] = ['All', 'Ongoing', 'Completed', 'On Hold'];
const FILTER_STATUS: Record<Exclude<Filter, 'All'>, ProjectStatus> = {
  Ongoing: 'ongoing',
  Completed: 'completed',
  'On Hold': 'onhold',
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
        {/* Navy header */}
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

        {/* Filter tabs */}
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
            <Card style={StyleSheet.flatten([styles.projectCard, { borderLeftColor: STATUS_BORDER[item.status] }])}>
              <View style={styles.cardRow1}>
                <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
                <Badge {...STATUS_BADGE[item.status]} />
              </View>
              <View style={styles.cardRow2}>
                <Text style={styles.meta}>🏦 {item.client}</Text>
                <Text style={styles.meta}>📍 {item.city}</Text>
              </View>
              <View style={styles.cardRow3}>
                <ProgressBar value={item.progress} showLabel={false} style={styles.flex1} />
                <Text style={styles.pct}>{item.progress}%</Text>
              </View>
              <View style={styles.cardRow4}>
                <AvatarStack initials={item.engineers} />
                <TouchableOpacity onPress={() => router.push(`/(admin)/projects/${item.id}` as never)}>
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

  header: {
    backgroundColor: Colors.primary,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
  },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.surface },
  addBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.accent },
  addBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.surface },

  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: { borderBottomColor: Colors.accent },
  filterText: { fontFamily: FontFamily.medium, fontSize: 13, color: Colors.textSecondary },
  filterTextActive: { color: Colors.accent },

  list: { padding: Spacing[4] },
  sep: { height: Spacing[3] },

  projectCard: { borderLeftWidth: 3, gap: Spacing[2] },
  cardRow1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing[2] },
  projectName: { flex: 1, fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  cardRow2: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary },
  cardRow3: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  pct: { fontFamily: FontFamily.bold, fontSize: 12, color: Colors.primary, minWidth: 40, textAlign: 'right' },
  cardRow4: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  viewDetails: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.accent },

  avatarStack: { flexDirection: 'row' },
  stackAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.surface },
  stackOverlap: { marginLeft: -8 },
});
