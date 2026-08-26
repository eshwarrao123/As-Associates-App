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

// ─── Type Definitions ─────────────────────────────────────────────────────────

type ActivityType = 'upload' | 'progress' | 'request' | 'attendance';

type Filter = 'All' | 'Uploads' | 'Progress' | 'Requests' | 'Attendance';
const FILTERS: Filter[] = ['All', 'Uploads', 'Progress', 'Requests', 'Attendance'];

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

  // No backend activity/audit log system exists
  // Show empty state instead of fake data
  const activities: never[] = [];

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
          {/* Empty state - no backend activity/audit system exists */}
          <View style={styles.emptyContainer}>
            <Icon name="info" size="xl" color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Activity History Not Available</Text>
            <Text style={styles.emptyText}>
              Activity logging is not currently enabled. Recent actions can be viewed in the dashboard.
            </Text>
          </View>
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

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.5,
  },
});
