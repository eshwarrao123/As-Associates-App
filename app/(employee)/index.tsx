import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.store';
import { useMe } from '../../src/hooks/useMe';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { Icon } from '../../src/components/ui/Icon';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
  withAlpha,
} from '../../src/constants/tokens';
import type { Project, RecentUpload, AttendanceSummary } from '../../src/types/employee';

// ─── Mock data (replace with TanStack Query hooks) ────────────────────────────

// TODO Phase 3: replace with useQuery — useMyProjects()
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'ICICI Bank HQ',
    client: 'ICICI Bank',
    location: 'Andheri, Mumbai',
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
];

// TODO Phase 3: replace with useQuery — useAttendanceCalendar()
const MOCK_ATTENDANCE: AttendanceSummary = {
  present: 18,
  absent: 2,
  late: 1,
  totalWorkingDays: 21,
};

// TODO Phase 3: replace with useQuery — useMyUploads()
const MOCK_UPLOADS: RecentUpload[] = [
  {
    id: '1',
    filename: 'site_progress_july_w3.jpg',
    projectName: 'ICICI Bank HQ',
    uploadedAt: new Date().toISOString(),
    fileType: 'image',
  },
  {
    id: '2',
    filename: 'inspection_report_q2.pdf',
    projectName: 'Godrej One Retrofit',
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    fileType: 'pdf',
  },
  {
    id: '3',
    filename: 'floor_plan_v2.jpg',
    projectName: 'ICICI Bank HQ',
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    fileType: 'image',
  },
];

// ─── Greeting helper ─────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ─── Upload timestamp helper ─────────────────────────────────────────────────

function formatUploadTimestamp(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}`;
    }
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch {
    return isoDate;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Stat card — one of the 3 KPI tiles in the stats row */
interface StatCardProps {
  value?: number | string;
  label: string;
  iconName?: 'check' | 'checkCircle';
}

const StatCard: React.FC<StatCardProps> = ({ value, label, iconName }) => (
  <View style={styles.statCard}>
    {iconName ? (
      <Icon name={iconName} size="lg" color={Colors.primary} />
    ) : (
      <Text style={styles.statValue}>{value}</Text>
    )}
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/** Section header — "My Active Projects" + "View All" pattern */
interface SectionHeaderProps {
  title: string;
  linkText: string;
  onPress: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, linkText, onPress }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.sectionLink}>{linkText}</Text>
    </TouchableOpacity>
  </View>
);

/** Horizontal project card — for the scrollable project list */
interface HorizontalProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
}

const HorizontalProjectCard: React.FC<HorizontalProjectCardProps> = ({ project, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.75}
    onPress={() => onPress(project)}
    style={styles.projectCard}
  >
    {/* Thumbnail icon */}
    <View style={styles.projectHeader}>
      <View style={styles.projectThumbnail}>
        <Icon name="site" size="md" color={Colors.textSecondary} />
      </View>
      <View style={styles.projectHeaderInfo}>
        <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
        <Badge variant={project.status} />
      </View>
    </View>

    {/* Location */}
    <View style={styles.projectLocationRow}>
      <Icon name="location" size="sm" color={Colors.textMuted} />
      <Text style={styles.projectLocation} numberOfLines={1}>{project.location}</Text>
    </View>

    {/* Progress */}
    <View style={styles.projectProgressSection}>
      <View style={styles.projectProgressHeader}>
        <Text style={styles.projectProgressLabel}>Project Progress</Text>
        <Text style={styles.projectProgressValue}>{project.progress}%</Text>
      </View>
      <ProgressBar value={project.progress} showLabel={false} />
    </View>
  </TouchableOpacity>
);

/** Upload thumbnail — photo card with timestamp overlay */
interface UploadThumbnailProps {
  upload: RecentUpload;
  onPress: (upload: RecentUpload) => void;
}

const UploadThumbnail: React.FC<UploadThumbnailProps> = ({ upload, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.75}
    onPress={() => onPress(upload)}
    style={styles.uploadThumb}
  >
    {/* Placeholder photo area */}
    <View style={styles.uploadThumbImage}>
      <Icon name="photo" size="xl" color={Colors.textMuted} />
    </View>
    {/* Timestamp overlay at bottom */}
    <View style={styles.uploadThumbOverlay}>
      <Text style={styles.uploadThumbTimestamp} numberOfLines={1}>
        {formatUploadTimestamp(upload.uploadedAt)}
      </Text>
    </View>
  </TouchableOpacity>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeHomeScreen(): React.ReactElement {
  const { user: storeUser } = useAuthStore();
  const { data: meData, isLoading: isMeLoading } = useMe();
  const router = useRouter();
  const greeting = getGreeting();

  const handleProjectPress = useCallback(
    (project: Project) => {
      router.push({
        pathname: '/(employee)/project/[id]',
        params: { id: project.id },
      });
    },
    [router],
  );

  const handleUploadPress = useCallback((_upload: RecentUpload) => {
    // TODO: navigate to upload detail
  }, []);

  // Use API data if available, fallback to store user for immediate display
  const displayName = meData
    ? `${meData.firstName} ${meData.lastName}`
    : storeUser?.name ?? 'Employee';

  const displayDesignation = meData?.designation ?? storeUser?.department;

  const displayInitials = meData
    ? `${meData.firstName[0]}${meData.lastName[0]}`.toUpperCase()
    : storeUser?.avatarInitials ?? 'U';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────────────────────── */}
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
            <Avatar
              initials={displayInitials}
              size="sm"
            />
          </View>

          {/* ── Greeting ───────────────────────────────────────────────── */}
          <View style={styles.greetingSection}>
            {isMeLoading && !storeUser ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.greetingText}>
                  {greeting},{'\n'}{displayName}
                </Text>
                <Text style={styles.greetingSub}>
                  Here is your field summary for today.
                </Text>
              </>
            )}
          </View>

          {/* ── Stats Row (2 cards) ────────────────────────────────────── */}
          <View style={styles.statsRow}>
            <StatCard
              value={MOCK_PROJECTS.length}
              label={'Assigned\nProjects'}
            />
            <StatCard
              iconName="checkCircle"
              label="Present"
            />
          </View>

          {/* ── My Active Projects ─────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader
              title="My Active Projects"
              linkText="View All"
              onPress={() => router.push('/(employee)/projects')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {MOCK_PROJECTS.map((project) => (
                <HorizontalProjectCard
                  key={project.id}
                  project={project}
                  onPress={handleProjectPress}
                />
              ))}
            </ScrollView>
          </View>

          {/* ── Recent Uploads ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader
              title="Recent Uploads"
              linkText="Gallery"
              onPress={() => router.push('/(employee)/gallery' as never)}
            />
            <View style={styles.uploadsRow}>
              {MOCK_UPLOADS.map((upload) => (
                <UploadThumbnail
                  key={upload.id}
                  upload={upload}
                  onPress={handleUploadPress}
                />
              ))}
            </View>
          </View>
        </ScrollView>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing[6],
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
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

  // ── Greeting ────────────────────────────────────────────────────────────────
  greetingSection: {
    marginTop: Spacing[2],
    marginBottom: Spacing[4],
    paddingHorizontal: Spacing[4],
  },
  greetingText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  greetingSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginTop: Spacing[1],
  },

  // ── Stats Row ───────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[5],
    paddingHorizontal: Spacing[4],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    ...Shadow.sm,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // ── Section ─────────────────────────────────────────────────────────────────
  section: {
    marginBottom: Spacing[5],
    paddingHorizontal: Spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.primary,
  },

  // ── Horizontal scroll ───────────────────────────────────────────────────────
  horizontalScroll: {
    gap: Spacing[3],
    paddingRight: Spacing[1],
  },

  // ── Project Card (horizontal) ───────────────────────────────────────────────
  projectCard: {
    width: 260,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: Spacing[2],
    ...Shadow.sm,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  projectThumbnail: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[1],
  },
  projectName: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  projectLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  projectLocation: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  projectProgressSection: {
    gap: Spacing[1],
    marginTop: Spacing[1],
  },
  projectProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectProgressLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  projectProgressValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },

  // ── Upload Thumbnails ───────────────────────────────────────────────────────
  uploadsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  uploadThumb: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadThumbImage: {
    flex: 1,
    backgroundColor: withAlpha(Colors.primary, 0.06),
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadThumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.overlay,
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2],
  },
  uploadThumbTimestamp: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.surface,
    textAlign: 'center',
  },
});
