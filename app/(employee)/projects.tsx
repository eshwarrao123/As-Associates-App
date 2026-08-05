import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProjectCard } from '../../src/components/employee/ProjectCard';
import { BottomNav } from '../../src/components/ui/BottomNav';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
} from '../../src/constants/tokens';
import type { Project } from '../../src/types/employee';
import type { BadgeVariant } from '../../src/types';

// ─── Mock data (replace with TanStack Query) ──────────────────────────────────

const MOCK_ALL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'ICICI Bank HQ',
    client: 'ICICI Bank',
    location: 'BKC, Mumbai',
    status: 'ongoing',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-08-30',
  },
  {
    id: '2',
    name: 'Godrej One Retrofit',
    client: 'Godrej Properties',
    location: 'Vikhroli, Mumbai',
    status: 'ongoing',
    progress: 30,
    startDate: '2024-03-01',
    endDate: '2024-12-15',
  },
  {
    id: '3',
    name: 'Oberoi Sky Heights',
    client: 'Oberoi Realty',
    location: 'Borivali, Mumbai',
    status: 'completed',
    progress: 100,
    startDate: '2023-06-01',
    endDate: '2024-02-28',
  },
  {
    id: '4',
    name: 'HUL Corporate Campus',
    client: 'Hindustan Unilever',
    location: 'Andheri, Mumbai',
    status: 'onhold',
    progress: 45,
    startDate: '2024-02-10',
    endDate: '2024-11-30',
  },
];

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterOption = 'all' | BadgeVariant;

interface FilterTab {
  key: FilterOption;
  label: string;
}

const FILTER_TABS: FilterTab[] = [
  { key: 'all', label: 'All' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'onhold', label: 'On Hold' },
];

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ filter: FilterOption }> = ({ filter }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>📁</Text>
    <Text style={styles.emptyTitle}>No Projects Found</Text>
    <Text style={styles.emptyBody}>
      {filter === 'all'
        ? 'You have no projects assigned yet.'
        : `No projects with status "${filter}".`}
    </Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyProjectsScreen(): React.ReactElement {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const filteredProjects =
    activeFilter === 'all'
      ? MOCK_ALL_PROJECTS
      : MOCK_ALL_PROJECTS.filter((p) => p.status === activeFilter);

  const handleProjectPress = useCallback((_project: Project) => {
    // TODO: router.push(`/(employee)/project/${_project.id}`)
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'My Projects' }} />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* ── Filter Tabs ───────────────────────────────────────────────── */}
        <View style={styles.filterBar}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(tab.key)}
              style={[
                styles.filterChip,
                activeFilter === tab.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipLabel,
                  activeFilter === tab.key && styles.filterChipLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Project Count ─────────────────────────────────────────────── */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {filteredProjects.length}{' '}
            {filteredProjects.length === 1 ? 'project' : 'projects'}
          </Text>
        </View>

        {/* ── Project List ──────────────────────────────────────────────── */}
        <FlatList<Project>
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={handleProjectPress}
              style={styles.projectCard}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState filter={activeFilter} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <BottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Filter bar
  filterBar: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // Filter chips — DESIGN.md §19
  filterChip: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.badge,
    backgroundColor: Colors.track,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 16,
    letterSpacing: 0.24,
    color: Colors.textSecondary,
  },
  filterChipLabelActive: {
    color: Colors.surface,
  },

  // Count
  countRow: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[1],
  },
  countText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[6],
  },
  projectCard: {
    // no extra styles needed — ProjectCard handles its own appearance
  },
  separator: {
    height: Spacing[3],
  },

  // Empty state — DESIGN.md §18
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing[12],
    gap: Spacing[2],
  },
  emptyIcon: {
    fontSize: 48,
    color: '#C3C6CF',
    marginBottom: Spacing[2],
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
});
