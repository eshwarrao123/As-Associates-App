import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import { Icon } from '../../src/components/ui/Icon';
import { useAdminAttendance } from '../../src/hooks/useAdminReports';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
  withAlpha,
} from '../../src/constants/tokens';

// ─── Helpers & Types ──────────────────────────────────────────────────────────

const REPORT_TYPES = ['Attendance', 'Projects', 'Requests', 'Financial'] as const;
type ReportType = (typeof REPORT_TYPES)[number];

const PROJECT_OPTIONS = ['All Projects', 'ICICI Bank HQ - Andheri', 'Axis Bank - Bandra', 'HDFC Bank - Powai'];
const RANGE_OPTIONS = ['This Week', 'This Month', 'Last Month', 'This Quarter', 'Custom'];

interface AttendanceRow {
  name: string;
  present: number;
  absent: number;
  pct: string;
}

function calculateAttendanceRows(
  attendanceRecords: Array<{
    userId: string;
    status: string;
    user?: { firstName: string; lastName: string };
  }>,
): AttendanceRow[] {
  const userMap = new Map<
    string,
    { name: string; present: number; absent: number; total: number }
  >();

  attendanceRecords.forEach((record) => {
    if (!record.user) return;

    const userName = `${record.user.firstName} ${record.user.lastName}`;
    const existing = userMap.get(record.userId) || {
      name: userName,
      present: 0,
      absent: 0,
      total: 0,
    };

    if (record.status === 'PRESENT' || record.status === 'LATE') {
      existing.present += 1;
    } else if (record.status === 'ABSENT') {
      existing.absent += 1;
    }
    existing.total += 1;

    userMap.set(record.userId, existing);
  });

  return Array.from(userMap.values()).map((user) => ({
    name: user.name,
    present: user.present,
    absent: user.absent,
    pct: user.total > 0 ? `${Math.round((user.present / user.total) * 100)}%` : '0%',
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportsScreen(): React.ReactElement {
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType>('Attendance');
  const [project, setProject] = useState<string | null>('All Projects');
  const [range, setRange] = useState<string | null>('This Month');

  // Fetch attendance data (only when reportType is 'Attendance')
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useAdminAttendance();

  const attendanceRows =
    reportType === 'Attendance' && attendanceData
      ? calculateAttendanceRows(attendanceData)
      : [];

  const totalPresent = attendanceRows.reduce((s, r) => s + r.present, 0);
  const totalAbsent = attendanceRows.reduce((s, r) => s + r.absent, 0);

  const isLoading = reportType === 'Attendance' && attendanceLoading;

  // TODO: connect when endpoint available
  // For 'Projects', 'Requests', 'Financial' report types, use mock data or wait for endpoints

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — navy, flat */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Icon name="back" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reports</Text>
        </View>

        {/* Report type chips — horizontal scroll */}
        <View style={styles.typeBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeScroll}
          >
            {REPORT_TYPES.map((t) => {
              const active = reportType === t;
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.7}
                  onPress={() => setReportType(t)}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            reportType === 'Attendance' ? (
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetchAttendance}
                colors={[Colors.primary]}
              />
            ) : undefined
          }
        >
          {/* Filters */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>FILTERS</Text>
            <Dropdown label="Project"    value={project} options={PROJECT_OPTIONS} onSelect={setProject} />
            <Dropdown label="Date Range" value={range}   options={RANGE_OPTIONS}   onSelect={setRange}   />
            <Button label="Generate Report" onPress={() => {}} />
          </Card>

          {/* Preview table */}
          <Card noPadding style={styles.previewCard}>
            {/* Card section heading — body-lg: 16px / bold */}
            <Text style={styles.previewTitle}>{reportType} Report Preview</Text>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : reportType === 'Attendance' && attendanceRows.length > 0 ? (
              <>
                <View style={[styles.tableRow, styles.tableHead]}>
                  <Text style={[styles.th, styles.colName]}>Employee</Text>
                  <Text style={[styles.th, styles.colNum]}>P</Text>
                  <Text style={[styles.th, styles.colNum]}>A</Text>
                  <Text style={[styles.th, styles.colPct]}>%</Text>
                </View>

                {attendanceRows.map((r, i) => (
                  <View key={r.name} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                    <Text style={[styles.td, styles.colName]} numberOfLines={1}>
                      {r.name}
                    </Text>
                    <Text style={[styles.td, styles.colNum, { color: Colors.success }]}>
                      {r.present}
                    </Text>
                    <Text style={[styles.td, styles.colNum, { color: Colors.danger }]}>
                      {r.absent}
                    </Text>
                    <Text style={[styles.tdBold, styles.colPct]}>{r.pct}</Text>
                  </View>
                ))}

                <View style={[styles.tableRow, styles.tableFooter]}>
                  <Text style={[styles.tdBold, styles.colName]}>Total</Text>
                  <Text style={[styles.tdBold, styles.colNum]}>{totalPresent}</Text>
                  <Text style={[styles.tdBold, styles.colNum]}>{totalAbsent}</Text>
                  <Text style={[styles.tdBold, styles.colPct]}>—</Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {reportType === 'Attendance'
                    ? 'No attendance data available.'
                    : 'Report preview not yet available.'}
                </Text>
              </View>
            )}
          </Card>

          {/* Export buttons — outline variants, label-md */}
          <View style={styles.exportRow}>
            <TouchableOpacity activeOpacity={0.85} style={[styles.exportBtn, styles.pdfBtn]}>
              <Text style={styles.pdfText}>⬇ Export PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.exportBtn, styles.excelBtn]}>
              <Text style={styles.excelText}>⬇ Export Excel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <AdminBottomNav activeIndex={4} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    paddingVertical: Spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: Spacing[6],
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },

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

  // Report type chip bar
  typeBar: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  typeScroll: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  // Pill chips — navy fill when active
  typeChip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  // label-md: 14px / 500
  typeChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  typeChipTextActive: { color: Colors.textOnPrimary },

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },
  section: { gap: Spacing[3] },

  // Overline: xs (11px) / medium / wider letter-spacing / muted
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },

  // Preview card — no internal padding; title + table handle their own spacing
  previewCard: { overflow: 'hidden' },
  // Card section heading — body-lg: 16px / bold
  previewTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    padding: Spacing[3],
  },

  // Table rows
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
    alignItems: 'center',
  },
  tableHead: { backgroundColor: Colors.primary },
  tableRowAlt: { backgroundColor: Colors.background },
  tableFooter: {
    backgroundColor: withAlpha(Colors.primary, 0.06),
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  // Table text — label-sm (12px) for headers, body-md (14px) for data
  th: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
  },
  td: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  tdBold: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  colName: { flex: 1, textAlign: 'left' },
  colNum:  { width: 40, textAlign: 'center' },
  colPct:  { width: 52, textAlign: 'right' },

  // Export buttons — outline style, 48px height, label-md (14px/500) per §6
  exportRow: { flexDirection: 'row', gap: Spacing[3] },
  exportBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.btn,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBtn:   { borderColor: Colors.primary, backgroundColor: Colors.surface },
  pdfText:  { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.primary },
  excelBtn: { borderColor: Colors.success, backgroundColor: Colors.surface },
  excelText: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.success },
});
