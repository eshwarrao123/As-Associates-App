import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProject } from '../../../src/hooks/useProject';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { Icon } from '../../../src/components/ui/Icon';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
} from '../../../src/constants/tokens';
import type { BadgeVariant } from '../../../src/types';

// ─── Mock data (replace with TanStack Query) ──────────────────────────────────
// Mock data removed - using real API via useProject(id)

interface TeamMember {
  id: string;
  initials: string;
}

const TEAM_OVERFLOW = 2;

const TABS = ['Overview', 'Photos', 'Progress', 'Requests'] as const;
type Tab = (typeof TABS)[number];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeProjectDetailScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading, isError } = useProject(id ?? '');
  const [tab, setTab] = useState<Tab>('Overview');

  // Map team members from API to display format
  const teamMembers: TeamMember[] =
    project?.team?.slice(0, 3).map((member) => ({
      id: member.id,
      initials: `${member.firstName[0]}${member.lastName[0]}`.toUpperCase(),
    })) ?? [];

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.appBar}>
            <TouchableOpacity
              hitSlop={12}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Icon name="back" size="lg" color={Colors.primaryDark} />
            </TouchableOpacity>
            <Text style={styles.appBarTitle}>Project Details</Text>
            <View style={styles.appBarSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Show error state
  if (isError || !project) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.appBar}>
            <TouchableOpacity
              hitSlop={12}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Icon name="back" size="lg" color={Colors.primaryDark} />
            </TouchableOpacity>
            <Text style={styles.appBarTitle}>Project Details</Text>
            <View style={styles.appBarSpacer} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load project details.</Text>
          </View>
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
          <TouchableOpacity
            hitSlop={12}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Icon name="back" size="lg" color={Colors.primaryDark} />
          </TouchableOpacity>

          <Text style={styles.appBarTitle}>Project Details</Text>

          {/* Balances the leading arrow so the title stays optically centred */}
          <View style={styles.appBarSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Title Block ─────────────────────────────────────────────── */}
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Badge variant={project.status} style={styles.titleBadge} />
            </View>

            <View style={styles.metaRow}>
              <Icon
                name="clientOutline"
                size="sm"
                color={Colors.textMuted}
              />
              <Text style={styles.metaText}>{project.client}</Text>

              <View style={styles.metaDot} />

              <Icon
                name="locationOutline"
                size="sm"
                color={Colors.textMuted}
              />
              <Text style={styles.metaText}>{project.location}</Text>
            </View>
          </View>

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <View style={styles.tabBar}>
            {TABS.map((t) => {
              const isActive = tab === t;
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.7}
                  onPress={() => setTab(t)}
                  style={[styles.tab, isActive && styles.tabActive]}
                >
                  <Text
                    style={[styles.tabText, isActive && styles.tabTextActive]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {tab === 'Overview' && (
            <View style={styles.sectionStack}>
              {/* ── Project Scope ───────────────────────────────────────── */}
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>PROJECT SCOPE</Text>
                <Text style={styles.scopeText}>{project.scope}</Text>
              </Card>

              {/* ── Timeline ────────────────────────────────────────────── */}
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>TIMELINE</Text>

                <View style={styles.dateRow}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateValue}>{project.startDate}</Text>
                  </View>

                  <View style={styles.dateDivider} />

                  <View style={[styles.dateCol, styles.dateColEnd]}>
                    <Text style={styles.dateLabel}>Target End</Text>
                    <Text style={styles.dateValue}>{project.targetEnd}</Text>
                  </View>
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.progressHead}>
                  <Text style={styles.progressLabel}>Overall Progress</Text>
                  <Text style={styles.progressPct}>{project.progress}%</Text>
                </View>

                <ProgressBar
                  value={project.progress}
                  showLabel={false}
                  fillColor={Colors.primaryDark}
                />
              </Card>

              {/* ── Assigned Team ───────────────────────────────────────── */}
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>ASSIGNED TEAM</Text>

                <View style={styles.teamRow}>
                  <View style={styles.avatarStack}>
                    {teamMembers.map((member, index) => (
                      <Avatar
                        key={member.id}
                        initials={member.initials}
                        size="sm"
                        style={
                          index === 0
                            ? styles.avatarFirst
                            : styles.avatarOverlap
                        }
                      />
                    ))}

                    {TEAM_OVERFLOW > 0 && (
                      <View style={[styles.overflowChip, styles.avatarOverlap]}>
                        <Text style={styles.overflowText}>+{TEAM_OVERFLOW}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.viewAllBtn}
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                    <Icon
                      name="chevronRight"
                      size="sm"
                      color={Colors.primaryDark}
                    />
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          )}

          {tab === 'Photos' && (
            <View style={styles.sectionStack}>
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>SITE PHOTOS</Text>
                <Text style={styles.placeholderText}>
                  No photos uploaded for this project yet.
                </Text>
              </Card>
            </View>
          )}

          {tab === 'Progress' && (
            <View style={styles.sectionStack}>
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>WORK PROGRESS</Text>
                <Text style={styles.placeholderText}>
                  No progress entries logged for this project yet.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.tabNavBtn}
                  onPress={() => router.push('/(employee)/progress')}
                >
                  <Text style={styles.tabNavBtnText}>Log Progress</Text>
                </TouchableOpacity>
              </Card>
            </View>
          )}

          {tab === 'Requests' && (
            <View style={styles.sectionStack}>
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>PROJECT REQUESTS</Text>
                <Text style={styles.placeholderText}>
                  No requests raised for this project yet.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.tabNavBtn}
                  onPress={() => router.push('/(employee)/requests')}
                >
                  <Text style={styles.tabNavBtnText}>Raise Request</Text>
                </TouchableOpacity>
              </Card>
            </View>
          )}
        </ScrollView>
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

  // App bar — light surface per Stitch screen
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: Spacing[4],
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
  appBarSpacer: {
    width: 24,
  },

  scrollContent: {
    paddingBottom: Spacing[8],
  },

  // Title block
  titleBlock: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
    gap: Spacing[2],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  projectName: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.primaryDark,
  },
  titleBadge: {
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.textMuted,
    marginHorizontal: Spacing[1],
  },

  // Tabs — underline indicator
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingVertical: Spacing[3],
    marginRight: Spacing[6],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primaryDark,
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: 18,
    letterSpacing: 0.14,
    color: Colors.textMuted,
  },
  tabTextActive: {
    fontFamily: FontFamily.bold,
    color: Colors.primaryDark,
  },

  // Sections
  sectionStack: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    gap: Spacing[3],
  },
  section: {
    gap: Spacing[3],
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    lineHeight: 16,
    letterSpacing: 1,
    color: Colors.textSecondary,
  },
  scopeText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.primary,
  },
  placeholderText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.textSecondary,
  },

  // Timeline
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateCol: {
    flex: 1,
    gap: Spacing[1],
  },
  dateColEnd: {
    alignItems: 'flex-end',
  },
  dateDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[4],
  },
  dateLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.textMuted,
  },
  dateValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.primaryDark,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  progressHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  progressPct: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.primaryDark,
  },

  // Assigned team
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarFirst: {
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  avatarOverlap: {
    marginLeft: -Spacing[2],
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  overflowChip: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.infoSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.primaryDark,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  viewAllText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.primaryDark,
  },
  tabNavBtn: {
    marginTop: Spacing[3],
    height: 40,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabNavBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.danger,
    textAlign: 'center',
  },
});
