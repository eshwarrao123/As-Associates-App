import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProject } from '../../../src/hooks/useProject';
import { useProjectUploads } from '../../../src/hooks/useProjectUploads';
import { useProjectProgressLogs } from '../../../src/hooks/useProjectProgressLogs';
import { useProjectRequests } from '../../../src/hooks/useProjectRequests';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { Icon } from '../../../src/components/ui/Icon';
import { ImageViewer } from '../../../src/components/ui/ImageViewer';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  withAlpha,
} from '../../../src/constants/tokens';
import type { BadgeVariant } from '../../../src/types';

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Formats a date string to human-readable format.
 * @param dateString - ISO date string (YYYY-MM-DD or full ISO)
 * @returns Formatted date (e.g., "26 Aug 2026")
 */
function formatDate(dateString?: string): string {
  if (!dateString) return 'Not set';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Formats a timestamp to relative time.
 * @param isoDate - ISO datetime string
 * @returns Relative time string (e.g., "2 days ago")
 */
function formatRelativeTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return isoDate;
  }
}

/**
 * Maps request status to badge variant.
 */
function mapRequestStatusToBadge(status: string): BadgeVariant {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'pending';
  }
}

interface TeamMember {
  id: string;
  initials: string;
  name: string;
  photoUrl?: string | null;
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
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Fetch project-specific data
  const { data: uploads, isLoading: isLoadingUploads } = useProjectUploads(id ?? '');
  const { data: progressLogs, isLoading: isLoadingProgress } = useProjectProgressLogs(id ?? '');
  const { data: requests, isLoading: isLoadingRequests } = useProjectRequests(id ?? '');

  // Map team members from API to display format
  const teamMembers: TeamMember[] =
    project?.team?.slice(0, 3).map((member) => ({
      id: member.id,
      initials: `${member.firstName[0]}${member.lastName[0]}`.toUpperCase(),
      name: `${member.firstName} ${member.lastName}`,
      photoUrl: member.photoUrl ?? null,
    })) ?? [];

  const teamOverflowCount = Math.max(0, (project?.team?.length ?? 0) - 3);

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

              {/* ── Services Required ────────────────────────────────────── */}
              {(project.services && project.services.length > 0) || project.customService ? (
                <Card style={styles.section}>
                  <Text style={styles.sectionLabel}>SERVICES REQUIRED</Text>
                  <View style={styles.serviceChipWrap}>
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

              {/* ── Timeline ────────────────────────────────────────────── */}
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>TIMELINE</Text>

                <View style={styles.dateRow}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateValue}>{formatDate(project.startDate)}</Text>
                  </View>

                  <View style={styles.dateDivider} />

                  <View style={[styles.dateCol, styles.dateColEnd]}>
                    <Text style={styles.dateLabel}>Target End</Text>
                    <Text style={styles.dateValue}>
                      {project.targetEnd && project.targetEnd !== 'Not set'
                        ? formatDate(project.targetEnd)
                        : 'Not set'}
                    </Text>
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
                        photoUrl={member.photoUrl ?? null}
                        style={
                          index === 0
                            ? styles.avatarFirst
                            : styles.avatarOverlap
                        }
                      />
                    ))}

                    {teamOverflowCount > 0 && (
                      <View style={[styles.overflowChip, styles.avatarOverlap]}>
                        <Text style={styles.overflowText}>+{teamOverflowCount}</Text>
                      </View>
                    )}
                  </View>

                  {project?.team && project.team.length > 0 && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.viewAllBtn}
                      onPress={() => {
                        const teamList = project.team
                          .map((m) => {
                            const name = `${m.firstName} ${m.lastName}`;
                            const designation = m.designation || 'Employee';
                            return `${name}\n${designation}`;
                          })
                          .join('\n\n');
                        Alert.alert('Team Members', teamList);
                      }}
                    >
                      <Text style={styles.viewAllText}>View All</Text>
                      <Icon
                        name="chevronRight"
                        size="sm"
                        color={Colors.primaryDark}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            </View>
          )}

          {tab === 'Photos' && (
            <View style={styles.sectionStack}>
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>SITE PHOTOS</Text>
                {isLoadingUploads ? (
                  <View style={styles.loadingContainer}>
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
                        {upload.resourceType === 'IMAGE' ? (
                          <Image
                            source={{ uri: upload.url }}
                            style={styles.photoImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.photoPlaceholder}>
                            <Icon name="photo" size="xl" color={Colors.textMuted} />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>
                    No photos uploaded for this project yet.
                  </Text>
                )}
              </Card>
            </View>
          )}

          {tab === 'Progress' && (
            <View style={styles.sectionStack}>
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>WORK PROGRESS</Text>
                {isLoadingProgress ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : progressLogs && progressLogs.length > 0 ? (
                  <>
                    {progressLogs.map((log, index) => (
                      <View
                        key={log.id}
                        style={[
                          styles.progressLogRow,
                          index < progressLogs.length - 1 && styles.progressLogBorder,
                        ]}
                      >
                        <View style={styles.progressLogHeader}>
                          <Text style={styles.progressLogTitle} numberOfLines={1}>
                            {log.title}
                          </Text>
                          {log.workStage && (
                            <View style={styles.workStageChip}>
                              <Text style={styles.workStageText}>{log.workStage}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.progressLogDesc} numberOfLines={2}>
                          {log.description}
                        </Text>
                        <Text style={styles.progressLogDate}>
                          {formatRelativeTime(log.createdAt)}
                        </Text>
                      </View>
                    ))}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.tabNavBtn}
                      onPress={() => router.push('/(employee)/progress')}
                    >
                      <Text style={styles.tabNavBtnText}>Log New Progress</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </Card>
            </View>
          )}

          {tab === 'Requests' && (
            <View style={styles.sectionStack}>
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>PROJECT REQUESTS</Text>
                {isLoadingRequests ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : requests && requests.length > 0 ? (
                  <>
                    {requests.map((request, index) => (
                      <View
                        key={request.id}
                        style={[
                          styles.requestRow,
                          index < requests.length - 1 && styles.requestBorder,
                        ]}
                      >
                        <View style={styles.requestHeader}>
                          <View style={styles.flex1}>
                            <Text style={styles.requestSubject} numberOfLines={1}>
                              {request.subject}
                            </Text>
                            <Text style={styles.requestType}>
                              {request.type} • {request.priority}
                            </Text>
                          </View>
                          <Badge
                            variant={mapRequestStatusToBadge(request.status)}
                            label={request.status}
                          />
                        </View>
                        <Text style={styles.requestDesc} numberOfLines={2}>
                          {request.description}
                        </Text>
                        <Text style={styles.requestDate}>
                          {formatRelativeTime(request.createdAt)}
                        </Text>
                      </View>
                    ))}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.tabNavBtn}
                      onPress={() => router.push('/(employee)/requests')}
                    >
                      <Text style={styles.tabNavBtnText}>Raise New Request</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </Card>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Full-screen Image Viewer */}
      {uploads && uploads.length > 0 && (
        <ImageViewer
          visible={viewerVisible}
          images={uploads.map((upload) => ({ id: upload.id, url: upload.url }))}
          initialIndex={selectedPhotoIndex}
          onClose={() => setViewerVisible(false)}
        />
      )}
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

  // Service chips
  serviceChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  serviceChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: BorderRadius.badge,
    backgroundColor: withAlpha(Colors.primaryDark, 0.08),
  },
  serviceChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.primaryDark,
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

  // Photo grid — 3 columns
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  photoThumb: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: BorderRadius.btn,
    overflow: 'hidden',
    backgroundColor: Colors.background,
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

  // Progress log rows
  progressLogRow: {
    gap: Spacing[1],
    paddingBottom: Spacing[3],
  },
  progressLogBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing[3],
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
    lineHeight: 20,
    color: Colors.primaryDark,
  },
  workStageChip: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.badge,
    backgroundColor: withAlpha(Colors.accent, 0.12),
  },
  workStageText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  progressLogDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  progressLogDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // Request rows
  requestRow: {
    gap: Spacing[1],
    paddingBottom: Spacing[3],
  },
  requestBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing[3],
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  flex1: {
    flex: 1,
  },
  requestSubject: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.primaryDark,
  },
  requestType: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  requestDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  requestDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // Loading and error states
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[4],
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
