import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import { Icon, type IconName } from '../../src/components/ui/Icon';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../src/constants/tokens';
import type { BadgeVariant } from '../../src/types';
import { useEmployeeCount, useProjectCount } from '../../src/hooks/useAdminDashboard';
import { useAllRequests, useUpdateRequestStatus } from '../../src/hooks/useAdminRequests';
import { getErrorMessage } from '../../src/services/api/errorHandler';

// ─── Mock data ────────────────────────────────────────────────────────────────

interface Kpi {
  value: string | number;
  label: string;
  accent: string;
  valueColor?: string;
  trend?: string;
  /** Semantic icon name from Icon component */
  icon: IconName;
  /** Subtle background for icon container */
  iconBg: string;
  /** Whether this KPI is loading from API */
  isLoading?: boolean;
}

// Mock data for KPIs that aren't connected to API yet
const ONGOING_PROJECTS_COUNT = '11';
const PENDING_REQUESTS_COUNT = '6';

interface StatusProject {
  id: string;
  name: string;
  client: string;
  progress: number;
  /** Subtitle in "Category • Phase" format per Stitch */
  subtitle: string;
  /** Progress bar fill colour — alternates navy/amber per Stitch */
  barColor: string;
}

const STATUS_PROJECTS: StatusProject[] = [
  {
    id: '1',
    name: 'City Center Plaza',
    client: 'ICICI Bank',
    progress: 75,
    subtitle: 'Commercial • Phase 2',
    barColor: Colors.primary,
  },
  {
    id: '2',
    name: 'Riverside Apartments',
    client: 'Axis Bank',
    progress: 30,
    subtitle: 'Residential • Foundation',
    barColor: Colors.accent,
  },
  {
    id: '3',
    name: 'Tech Park Hub',
    client: 'HDFC Bank',
    progress: 92,
    subtitle: 'Industrial • Final Fit-out',
    barColor: Colors.primary,
  },
];

interface Activity {
  id: string;
  initials: string;
  text: string;
  time: string;
  /** Bullet dot colour per Stitch timeline */
  dotColor: string;
}

const ACTIVITIES: Activity[] = [
  { id: 'a1', initials: 'SJ', text: 'Sarah Jenkins uploaded new site photos for City Center Plaza.', time: '10:45 AM • Today', dotColor: Colors.primary },
  { id: 'a2', initials: 'MR', text: 'Mike Ross marked foundation stage complete on Riverside Apartments.', time: '09:15 AM • Today', dotColor: Colors.accent },
  { id: 'a3', initials: 'VP', text: 'Material delivery delayed for Tech Park Hub.', time: 'Yesterday', dotColor: Colors.danger },
];

interface PendingRequest {
  id: string;
  priority: BadgeVariant;
  priorityLabel: string;
  type: string;
  person: string;
  detail: string;
  /** Relative time shown in top-right of card per Stitch */
  timeAgo: string;
}

const PENDING: PendingRequest[] = [
  {
    id: 'p1',
    priority: 'rejected',
    priorityLabel: 'High',
    type: 'Material Approval',
    person: 'Rahul Kumar',
    detail: 'Steel grade 500 requirement for structural reinforcement at Phase 2.',
    timeAgo: '2h ago',
  },
  {
    id: 'p2',
    priority: 'pending',
    priorityLabel: 'Medium',
    type: 'Leave Request',
    person: 'David Chen',
    detail: 'David Chen - Site Supervisor. Aug 12-14.',
    timeAgo: '4h ago',
  },
  {
    id: 'p3',
    priority: 'pending',
    priorityLabel: 'Low',
    type: 'Expense Claim',
    person: 'Vikram Singh',
    detail: 'Transportation and fuel - $145.00',
    timeAgo: '1d ago',
  },
];

// ─── Action Buttons — Stitch: "Approve" (navy) + "Review" (outline) ───────────

const ActionButtons: React.FC<{ onReview: () => void }> = ({ onReview }) => (
  <View style={styles.actionRow}>
    <TouchableOpacity activeOpacity={0.85} style={styles.approveBtn}>
      <Text style={styles.approveText}>Approve</Text>
    </TouchableOpacity>
    <TouchableOpacity activeOpacity={0.85} style={styles.reviewBtn} onPress={onReview}>
      <Text style={styles.reviewText}>Review</Text>
    </TouchableOpacity>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardScreen(): React.ReactElement {
  const router = useRouter();

  // Fetch API data for counts
  const { data: employeeData, isLoading: isLoadingEmployees } = useEmployeeCount();
  const { data: projectData, isLoading: isLoadingProjects } = useProjectCount();
  const { data: pendingRequests } = useAllRequests('PENDING');
  const updateRequestStatus = useUpdateRequestStatus();

  // Build KPIs array with real data
  const KPIS: Kpi[] = [
    {
      value: isLoadingProjects
        ? '--'
        : projectData?.meta?.total ?? '--',
      label: 'Total Projects',
      accent: Colors.primary,
      trend: '↑ 12%',
      icon: 'projectsOutline',
      iconBg: Colors.background,
      isLoading: isLoadingProjects,
    },
    {
      value: ONGOING_PROJECTS_COUNT,
      label: 'Ongoing',
      accent: Colors.accent,
      icon: 'progress',
      iconBg: Colors.warningSubtle,
    },
    {
      value: isLoadingEmployees
        ? '--'
        : employeeData?.meta?.total ?? '--',
      label: 'Total Employees',
      accent: Colors.success,
      icon: 'employeesOutline',
      iconBg: Colors.background,
      isLoading: isLoadingEmployees,
    },
    {
      value: PENDING_REQUESTS_COUNT,
      label: 'Pending Requests',
      accent: Colors.danger,
      valueColor: Colors.danger,
      icon: 'document',
      iconBg: Colors.dangerSubtle,
    },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* ── Header — Stitch: white bg, logo+name left, bell icon right ──── */}
        <View style={styles.header}>
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
          <TouchableOpacity activeOpacity={0.7}>
            <Icon name="requestsOutline" size="lg" color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Page Title Block — ADD per Stitch ──────────────────────── */}
          <View style={styles.pageTitleBlock}>
            <Text style={styles.pageTitle}>Dashboard</Text>
            <Text style={styles.pageSubtitle}>
              Overview of operations and key metrics.
            </Text>
          </View>

          {/* ── KPI Grid — PATCH: no left border, add icon, uniform value color ─ */}
          <View style={styles.kpiGrid}>
            {KPIS.map((kpi) => (
              <View key={kpi.label} style={styles.kpiCard}>
                <View style={[styles.kpiIconContainer, { backgroundColor: kpi.iconBg }]}>
                  <Icon name={kpi.icon} size="md" color={Colors.textSecondary} />
                </View>
                {kpi.isLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={styles.kpiLoader} />
                ) : (
                  <Text style={styles.kpiValue}>{kpi.value}</Text>
                )}
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Project Status — PATCH: "View All" amber, subtitle format ──── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Project Status</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/projects' as never)}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.listCard}>
            {STATUS_PROJECTS.map((p, i) => (
              <View
                key={p.id}
                style={[styles.statusRow, i < STATUS_PROJECTS.length - 1 && styles.rowDivider]}
              >
                <Text style={styles.statusName}>{p.name}</Text>
                <Text style={styles.statusSubtitle}>{p.subtitle}</Text>
                <View style={styles.statusProgress}>
                  <ProgressBar
                    value={p.progress}
                    showLabel={false}
                    fillColor={p.barColor}
                    style={styles.flex1}
                  />
                  <Text style={styles.statusPct}>{p.progress}%</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* ── Recent Activity — PATCH: timeline dots, no avatars ──────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          <Card style={styles.listCard}>
            {ACTIVITIES.map((a, i) => (
              <View
                key={a.id}
                style={[
                  styles.timelineRow,
                  i < ACTIVITIES.length - 1 && styles.rowDivider,
                ]}
              >
                {/* Timeline dot + line */}
                <View style={styles.timelineDotCol}>
                  <View style={[styles.timelineDot, { backgroundColor: a.dotColor }]} />
                  {i < ACTIVITIES.length - 1 && <View style={styles.timelineLine} />}
                </View>
                {/* Content */}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTime}>{a.time}</Text>
                  <Text style={styles.timelineText}>{a.text}</Text>
                </View>
              </View>
            ))}

            {/* Footer: "View Full History" button */}
            <TouchableOpacity style={styles.historyBtn} activeOpacity={0.7} onPress={() => router.push('/(admin)/activity-history' as never)}>
              <Text style={styles.historyBtnText}>View Full History</Text>
              <Icon name="forward" size="sm" color={Colors.textPrimary} />
            </TouchableOpacity>
          </Card>

          {/* ── Action Required — Real pending requests from API ──────── */}
          {pendingRequests && pendingRequests.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Icon name="warning" size="md" color={Colors.danger} />
                  <Text style={styles.sectionTitle}>Action Required</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{pendingRequests.length} New</Text>
                </View>
              </View>
              {pendingRequests.slice(0, 3).map((req) => {
                const requesterName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Unknown';
                const typeLabel = req.type === 'MATERIAL' ? 'Material Request' : 'Issue Report';

                return (
                  <TouchableOpacity
                    key={req.id}
                    activeOpacity={0.9}
                    onPress={() => router.push('/(admin)/requests' as never)}
                  >
                    <Card style={styles.pendingCard}>
                      <View style={styles.pendingTop}>
                        <Text style={styles.pendingType}>{typeLabel}</Text>
                        <Text style={styles.pendingTime}>{requesterName}</Text>
                      </View>
                      <Text style={styles.pendingDetail}>{req.subject || req.description}</Text>
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.approveBtn}
                          onPress={() => {
                            updateRequestStatus.mutate({ id: req.id, status: 'APPROVED' }, {
                              onError: (error) => {
                                const message = getErrorMessage(error);
                                Alert.alert('Error', message);
                              },
                            });
                          }}
                          disabled={updateRequestStatus.isPending}
                        >
                          {updateRequestStatus.isPending ? (
                            <ActivityIndicator size="small" color={Colors.textOnPrimary} />
                          ) : (
                            <Text style={styles.approveText}>Approve</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.reviewBtn}
                          onPress={() => router.push('/(admin)/requests' as never)}
                        >
                          <Text style={styles.reviewText}>Review</Text>
                        </TouchableOpacity>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
              {pendingRequests.length > 3 && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/(admin)/requests' as never)}
                  style={styles.viewAllBtn}
                >
                  <Text style={styles.viewAllBtnText}>View All Requests</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>

        <AdminBottomNav activeIndex={0} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },

  // ── Header (PATCH: white bg, logo mark, icon instead of emoji) ────────────
  header: {
    backgroundColor: Colors.surface,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
    lineHeight: 18,
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.textPrimary,
  },

  // ── Scroll content ────────────────────────────────────────────────────────
  content: {
    padding: Spacing[4],
    gap: Spacing[5],
    paddingBottom: Spacing[8],
  },

  // ── Page Title Block (ADD) ────────────────────────────────────────────────
  pageTitleBlock: {
    gap: Spacing[1],
  },
  pageTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },

  // ── KPI Grid (PATCH: no left border, add icon, uniform value color) ───────
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  kpiCard: {
    width: '47.5%' as unknown as number,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: Spacing[1],
    ...Shadow.card,
  },
  kpiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[1],
  },
  kpiValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  kpiLoader: {
    height: 28,
    marginVertical: 0,
  },
  kpiLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  // ── Section Header ────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  viewAll: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  countBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.surface,
  },

  // ── Generic list card ─────────────────────────────────────────────────────
  listCard: { paddingVertical: Spacing[1] },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },

  // ── Project Status rows ───────────────────────────────────────────────────
  statusRow: { paddingVertical: Spacing[3], gap: Spacing[1] },
  statusName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  statusSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  statusProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  statusPct: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.primary,
    minWidth: 34,
    textAlign: 'right',
  },

  // ── Recent Activity — timeline layout ─────────────────────────────────────
  timelineRow: {
    flexDirection: 'row',
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  timelineDotCol: {
    alignItems: 'center',
    width: Spacing[2],
  },
  timelineDot: {
    width: Spacing[2],
    height: Spacing[2],
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing[1],
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  timelineTime: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  timelineText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    height: 40,
    borderRadius: BorderRadius.btn,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing[2],
    marginHorizontal: Spacing[1],
    marginBottom: Spacing[2],
  },
  historyBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  // ── Action Required cards ─────────────────────────────────────────────────
  pendingCard: { gap: Spacing[2] },
  pendingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingType: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  pendingTime: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  pendingDetail: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },

  // ── Action buttons: Approve (navy) + Review (outline) ─────────────────────
  actionRow: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[1] },
  approveBtn: {
    flex: 1,
    height: 36,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
  },
  reviewBtn: {
    flex: 1,
    height: 36,
    borderRadius: BorderRadius.btn,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  viewAllBtn: {
    height: 44,
    borderRadius: BorderRadius.btn,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.primary,
  },
});
