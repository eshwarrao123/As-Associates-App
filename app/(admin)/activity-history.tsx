import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/ui/Icon';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  Spacing,
} from '../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

type ActivityType = 'upload' | 'progress' | 'request' | 'attendance';

interface ActivityItem {
  id: string;
  time: string;
  date: string;
  employeeName: string;
  action: string;
  projectName: string;
  type: ActivityType;
}

const ACTIVITIES: ActivityItem[] = [
  { id: '1', time: '10:45 AM', date: 'Today', employeeName: 'Rahul Kumar', action: 'uploaded site photos for', projectName: 'ICICI Bank HQ - Andheri', type: 'upload' },
  { id: '2', time: '09:30 AM', date: 'Today', employeeName: 'Anita Sharma', action: 'marked foundation stage complete on', projectName: 'Axis Bank - Bandra', type: 'progress' },
  { id: '3', time: '08:15 AM', date: 'Today', employeeName: 'Vikram Patel', action: 'raised a material request for', projectName: 'HDFC Bank - Powai', type: 'request' },
  { id: '4', time: '06:20 PM', date: 'Yesterday', employeeName: 'Priya Joshi', action: 'marked attendance for', projectName: 'Tech Park Phase 1', type: 'attendance' },
  { id: '5', time: '04:50 PM', date: 'Yesterday', employeeName: 'Manish Rao', action: 'uploaded progress photos for', projectName: 'Lodha Allumount', type: 'upload' },
  { id: '6', time: '02:30 PM', date: 'Yesterday', employeeName: 'Rahul Kumar', action: 'submitted a leave request', projectName: 'ICICI Bank HQ - Andheri', type: 'request' },
  { id: '7', time: '11:00 AM', date: 'Yesterday', employeeName: 'Anita Sharma', action: 'marked civil works stage complete on', projectName: 'Axis Bank - Bandra', type: 'progress' },
  { id: '8', time: '05:30 PM', date: '26 Jul', employeeName: 'Vikram Patel', action: 'marked attendance for', projectName: 'HDFC Bank - Powai', type: 'attendance' },
  { id: '9', time: '03:15 PM', date: '26 Jul', employeeName: 'Priya Joshi', action: 'uploaded site photos for', projectName: 'Tech Park Phase 1', type: 'upload' },
  { id: '10', time: '01:45 PM', date: '26 Jul', employeeName: 'Manish Rao', action: 'raised an issue request for', projectName: 'Lodha Allumount', type: 'request' },
  { id: '11', time: '10:20 AM', date: '25 Jul', employeeName: 'Rahul Kumar', action: 'marked electrical stage complete on', projectName: 'ICICI Bank HQ - Andheri', type: 'progress' },
  { id: '12', time: '09:00 AM', date: '25 Jul', employeeName: 'Anita Sharma', action: 'marked attendance for', projectName: 'Axis Bank - Bandra', type: 'attendance' },
  { id: '13', time: '07:30 AM', date: '25 Jul', employeeName: 'Vikram Patel', action: 'uploaded progress photos for', projectName: 'HDFC Bank - Powai', type: 'upload' },
];

type Filter = 'All' | 'Uploads' | 'Progress' | 'Requests' | 'Attendance';
const FILTERS: Filter[] = ['All', 'Uploads', 'Progress', 'Requests', 'Attendance'];

const FILTER_TYPE_MAP: Record<Exclude<Filter, 'All'>, ActivityType> = {
  Uploads: 'upload',
  Progress: 'progress',
  Requests: 'request',
  Attendance: 'attendance',
};

const TYPE_COLOR: Record<ActivityType, string> = {
  upload: Colors.primary,
  progress: Colors.accent,
  request: Colors.danger,
  attendance: Colors.success,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActivityHistoryScreen(): React.ReactElement {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('All');

  const filtered =
    filter === 'All'
      ? ACTIVITIES
      : ACTIVITIES.filter((a) => a.type === FILTER_TYPE_MAP[filter]);

  // Group by date
  const grouped: Record<string, ActivityItem[]> = {};
  filtered.forEach((item) => {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item);
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — navy, flat */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Icon name="back" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity History</Text>
        </View>

        {/* Filter chips */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <TouchableOpacity
                  key={f}
                  activeOpacity={0.7}
                  onPress={() => setFilter(f)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {Object.keys(grouped).map((date) => (
            <View key={date} style={styles.dateSection}>
              {/* Date header */}
              <Text style={styles.dateLabel}>{date}</Text>

              {/* Timeline items */}
              {grouped[date].map((item, idx) => {
                const isLast = idx === grouped[date].length - 1;
                return (
                  <View key={item.id} style={styles.timelineRow}>
                    {/* Left: time + vertical line */}
                    <View style={styles.timelineLeft}>
                      <Text style={styles.timeLabel}>{item.time}</Text>
                      <View style={styles.timelineTrack}>
                        <View style={[styles.dot, { backgroundColor: TYPE_COLOR[item.type] }]} />
                        {!isLast && <View style={styles.line} />}
                      </View>
                    </View>

                    {/* Right: activity text */}
                    <View style={styles.timelineRight}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityName}>{item.employeeName}</Text>
                        {' '}
                        <Text style={styles.activityAction}>{item.action}</Text>
                        {' '}
                        <Text style={styles.activityProject}>{item.projectName}</Text>
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <AdminBottomNav activeIndex={0} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Top app bar — 56px, navy, flat (no shadow per DESIGN.md §11)
  header: {
    backgroundColor: Colors.primary,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  // headline-sm: 18px / bold
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },

  // Filter bar
  filterBar: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  // Pill chips — navy fill when active
  chip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary },
  // label-md: 14px / 500
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  chipTextActive: { color: Colors.textOnPrimary },

  content: { padding: Spacing[4], gap: Spacing[4], paddingBottom: Spacing[8] },

  // Date section
  dateSection: { gap: Spacing[2] },
  // Date label — overline / small caps style
  dateLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing[1],
  },

  // Timeline row
  timelineRow: { flexDirection: 'row', gap: Spacing[3], paddingVertical: Spacing[1] },
  timelineLeft: { alignItems: 'flex-end', width: 64 },
  // Time label — label-sm: 12px / 500 / muted
  timeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  timelineTrack: { alignItems: 'center', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },

  timelineRight: { flex: 1, paddingTop: 2 },
  // Activity text — body-md: 14px / 400
  activityText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    color: Colors.textSecondary,
  },
  activityName: {
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  activityAction: {
    // inherits from activityText
  },
  activityProject: {
    fontFamily: FontFamily.medium,
    color: Colors.textPrimary,
  },
});
