import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

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

const ATTENDANCE_ROWS: AttendanceRow[] = [
  { name: 'Rahul Kumar', present: 21, absent: 3, pct: '87%' },
  { name: 'Anita Sharma', present: 23, absent: 1, pct: '96%' },
  { name: 'Vikram Patel', present: 19, absent: 5, pct: '79%' },
  { name: 'Priya Joshi', present: 24, absent: 0, pct: '100%' },
];

const TOTAL_PRESENT = ATTENDANCE_ROWS.reduce((s, r) => s + r.present, 0);
const TOTAL_ABSENT = ATTENDANCE_ROWS.reduce((s, r) => s + r.absent, 0);

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportsScreen(): React.ReactElement {
  const [reportType, setReportType] = useState<ReportType>('Attendance');
  const [project, setProject] = useState<string | null>('All Projects');
  const [range, setRange] = useState<string | null>('This Month');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Navy header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reports</Text>
        </View>

        {/* Report type chips */}
        <View style={styles.typeBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
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

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Filters */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>FILTERS</Text>
            <Dropdown label="Project" value={project} options={PROJECT_OPTIONS} onSelect={setProject} />
            <Dropdown label="Date Range" value={range} options={RANGE_OPTIONS} onSelect={setRange} />
            <Button label="Generate Report" onPress={() => {}} />
          </Card>

          {/* Preview */}
          <Card noPadding style={styles.previewCard}>
            <Text style={styles.previewTitle}>{reportType} Report Preview</Text>

            {/* Table header */}
            <View style={[styles.tableRow, styles.tableHead]}>
              <Text style={[styles.th, styles.colName]}>Employee</Text>
              <Text style={[styles.th, styles.colNum]}>P</Text>
              <Text style={[styles.th, styles.colNum]}>A</Text>
              <Text style={[styles.th, styles.colPct]}>%</Text>
            </View>

            {/* Rows */}
            {ATTENDANCE_ROWS.map((r, i) => (
              <View key={r.name} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.td, styles.colName]} numberOfLines={1}>{r.name}</Text>
                <Text style={[styles.td, styles.colNum, { color: Colors.success }]}>{r.present}</Text>
                <Text style={[styles.td, styles.colNum, { color: Colors.danger }]}>{r.absent}</Text>
                <Text style={[styles.tdBold, styles.colPct]}>{r.pct}</Text>
              </View>
            ))}

            {/* Totals */}
            <View style={[styles.tableRow, styles.tableFooter]}>
              <Text style={[styles.tdBold, styles.colName]}>Total</Text>
              <Text style={[styles.tdBold, styles.colNum]}>{TOTAL_PRESENT}</Text>
              <Text style={[styles.tdBold, styles.colNum]}>{TOTAL_ABSENT}</Text>
              <Text style={[styles.tdBold, styles.colPct]}>—</Text>
            </View>
          </Card>

          {/* Export */}
          <View style={styles.exportRow}>
            <TouchableOpacity activeOpacity={0.85} style={[styles.exportBtn, styles.pdfBtn]}>
              <Text style={styles.pdfText}>⬇ Export PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.exportBtn, styles.excelBtn]}>
              <Text style={styles.excelText}>⬇ Export Excel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <AdminBottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: { backgroundColor: Colors.primary, height: 56, justifyContent: 'center', paddingHorizontal: Spacing[4] },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.surface },

  typeBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  typeScroll: { paddingHorizontal: Spacing[3], paddingVertical: Spacing[3], gap: Spacing[2] },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipText: { fontFamily: FontFamily.medium, fontSize: 13, color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.surface },

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },
  section: { gap: Spacing[3] },
  sectionLabel: { fontFamily: FontFamily.medium, fontSize: 11, letterSpacing: 1, color: Colors.textSecondary },

  // Preview table
  previewCard: { overflow: 'hidden' },
  previewTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    padding: Spacing[3],
  },
  tableRow: { flexDirection: 'row', paddingHorizontal: Spacing[3], paddingVertical: 10, alignItems: 'center' },
  tableHead: { backgroundColor: Colors.primary },
  tableRowAlt: { backgroundColor: Colors.background },
  tableFooter: { backgroundColor: `${Colors.primary}10`, borderTopWidth: 1, borderTopColor: Colors.border },
  th: { fontFamily: FontFamily.bold, fontSize: 12, color: Colors.surface },
  td: { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textPrimary },
  tdBold: { fontFamily: FontFamily.bold, fontSize: 13, color: Colors.textPrimary },
  colName: { flex: 1, textAlign: 'left' },
  colNum: { width: 40, textAlign: 'center' },
  colPct: { width: 52, textAlign: 'right' },

  // Export
  exportRow: { flexDirection: 'row', gap: Spacing[3] },
  exportBtn: { flex: 1, height: 48, borderRadius: BorderRadius.btn, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pdfBtn: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  pdfText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.primary },
  excelBtn: { borderColor: Colors.success, backgroundColor: Colors.surface },
  excelText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.success },
});
