import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.store';
import { useMyProjects } from '../../src/hooks/useMyProjects';
import { ProjectCard } from '../../src/components/employee/ProjectCard';
import { Avatar } from '../../src/components/ui/Avatar';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { Icon } from '../../src/components/ui/Icon';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  InputHeight,
} from '../../src/constants/tokens';
import type { Project } from '../../src/types/employee';
import type { BadgeVariant } from '../../src/types';

// ─── Mock data (replace with TanStack Query) ──────────────────────────────────
// Mock data removed - using real API via useMyProjects()

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
  { key: 'upcoming', label: 'Upcoming' },
];

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ filter: FilterOption; query: string; isError?: boolean }> = ({
  filter,
  query,
  isError,
}) => (
  <View style={styles.emptyState}>
    <Icon name="projectsOutline" size="2xl" color={Colors.outlineVariant} />
    <Text style={styles.emptyTitle}>
      {isError ? 'Failed to load projects' : 'No Projects Found'}
    </Text>
    <Text style={styles.emptyBody}>
      {isError
        ? 'Failed to load projects. Pull down to refresh.'
        : query.trim()
          ? `No projects match "${query.trim()}".`
          : filter === 'all'
            ? 'You have no projects assigned yet.'
            : `No projects with status "${filter}".`}
    </Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyProjectsScreen(): React.ReactElement {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: projects, isLoading, isError, refetch } = useMyProjects();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [query, setQuery] = useState('');

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    const byStatus =
      activeFilter === 'all'
        ? projects
        : projects.filter((p) => p.status === activeFilter);

    const term = query.trim().toLowerCase();
    if (!term) return byStatus;

    return byStatus.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.client.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term),
    );
  }, [projects, activeFilter, query]);

  const handleProjectPress = useCallback(
    (project: Project) => {
      router.push({
        pathname: '/(employee)/project/[id]',
        params: { id: project.id },
      });
    },
    [router],
  );

  // Show loading indicator while fetching initial data
  if (isLoading && !projects) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.appBar}>
            <Image
              source={require('../../assets/logo-icon.png')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                overflow: 'hidden',
              }}
              resizeMode="contain"
            />
            <Avatar
              initials={user?.avatarInitials ?? 'U'}
              size="sm"
              style={styles.appBarAvatar}
            />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
          <BottomNav />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ── App Bar ───────────────────────────────────────────────────── */}
        <View style={styles.appBar}>
          <Image
            source={require('../../assets/logo-icon.png')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              overflow: 'hidden',
            }}
            resizeMode="contain"
          />
          <Avatar
            initials={user?.avatarInitials ?? 'U'}
            size="sm"
            style={styles.appBarAvatar}
          />
        </View>

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
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isLoading && !!projects}
              onRefresh={() => void refetch()}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            <View>
              {/* ── Page Heading ──────────────────────────────────────── */}
              <Text style={styles.pageTitle}>My Projects</Text>

              {/* ── Search ────────────────────────────────────────────── */}
              <View style={styles.searchField}>
                <Icon name="search" size="md" color={Colors.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search projects by name, client, or city..."
                  placeholderTextColor={Colors.textMuted}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>

              {/* ── Filter Chips ──────────────────────────────────────── */}
              <View style={styles.filterBar}>
                {FILTER_TABS.map((tab) => {
                  const isActive = activeFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      activeOpacity={0.7}
                      onPress={() => setActiveFilter(tab.key)}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipLabel,
                          isActive && styles.filterChipLabelActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState filter={activeFilter} query={query} isError={isError} />
          }
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

  // App bar — DESIGN.md §20 layout, light surface per Stitch screen
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.primaryDark,
  },
  appBarAvatar: {
    // avatar is already positioned by justifyContent: space-between
  },

  // Page heading — headline-lg-mobile (22/700/28)
  pageTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.primaryDark,
    marginBottom: Spacing[4],
  },

  // Search — DESIGN.md §7
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    height: InputHeight,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    // Android centres poorly without this reset
    paddingVertical: 0,
  },

  // Filter chips — pill, outlined when inactive, navy fill when active
  filterBar: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[3],
    marginBottom: Spacing[4],
  },
  filterChip: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.badge,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  filterChipLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: 18,
    letterSpacing: 0.14,
    color: Colors.textSecondary,
  },
  filterChipLabelActive: {
    color: Colors.textOnPrimary,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
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
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginTop: Spacing[2],
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },

  // Loading container
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
