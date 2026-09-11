import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Dropdown, type DropdownOption } from '../../src/components/ui/Dropdown';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import { Icon } from '../../src/components/ui/Icon';
import { useAdminAttendance, useAdminRequests } from '../../src/hooks/useAdminReports';
import { useAllProjects } from '../../src/hooks/useAdminProjects';
import { useEmployees } from '../../src/hooks/useEmployees';
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

const REPORT_TYPES = ['Attendance', 'Projects', 'Requests'] as const;
type ReportType = (typeof REPORT_TYPES)[number];

const RANGE_OPTIONS = ['This Week', 'This Month', 'Last Month', 'This Quarter'];

/**
 * Computes UTC start/end boundaries for a given range label.
 * All dates are midnight-based UTC to match backend @db.Date.
 */
function getDateRange(rangeLabel: string): { startDate: string; endDate: string } {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-based

  const fmt = (d: Date): string => {
    const yr = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const da = String(d.getUTCDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  };

  switch (rangeLabel) {
    case 'This Week': {
      // Monday of the current week
      const day = now.getUTCDay(); // 0=Sun
      const diff = day === 0 ? 6 : day - 1; // days since Monday
      const monday = new Date(Date.UTC(y, m, now.getUTCDate() - diff));
      return { startDate: fmt(monday), endDate: fmt(now) };
    }
    case 'This Month': {
      const first = new Date(Date.UTC(y, m, 1));
      return { startDate: fmt(first), endDate: fmt(now) };
    }
    case 'Last Month': {
      const first = new Date(Date.UTC(y, m - 1, 1));
      const last = new Date(Date.UTC(y, m, 0)); // last day of prev month
      return { startDate: fmt(first), endDate: fmt(last) };
    }
    case 'This Quarter': {
      const qStart = m - (m % 3);
      const first = new Date(Date.UTC(y, qStart, 1));
      return { startDate: fmt(first), endDate: fmt(now) };
    }
    default:
      // Fallback to this month
      return { startDate: fmt(new Date(Date.UTC(y, m, 1))), endDate: fmt(now) };
  }
}

// ─── Attendance calculation types ─────────────────────────────────────────────

interface AttendanceRow {
  userId: string;
  name: string;
  present: number;
  halfDay: number;
  total: number;
  pct: string;
}

function calculateAttendanceRows(
  records: Array<{
    userId: string;
    status: string;
    user?: { firstName: string; lastName: string };
  }>,
  allEmployees?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>,
): AttendanceRow[] {
  const userMap = new Map<
    string,
    { userId: string; name: string; present: number; halfDay: number; total: number }
  >();

  records.forEach((record) => {
    if (!record.user || !record.userId) return;

    const userName = `${record.user.firstName} ${record.user.lastName}`;
    const existing = userMap.get(record.userId) || {
      userId: record.userId,
      name: userName,
      present: 0,
      halfDay: 0,
      total: 0,
    };

    if (record.status === 'PRESENT') {
      existing.present += 1;
      existing.total += 1;
    } else if (record.status === 'HALF_DAY') {
      existing.halfDay += 1;
      existing.total += 1;
    }

    userMap.set(record.userId, existing);
  });

  // Include all active employees, even those with zero attendance
  if (allEmployees) {
    allEmployees.forEach((employee) => {
      if (!userMap.has(employee.id)) {
        userMap.set(employee.id, {
          userId: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          present: 0,
          halfDay: 0,
          total: 0,
        });
      }
    });
  }

  return Array.from(userMap.values()).map((user) => ({
    userId: user.userId,
    name: user.name,
    present: user.present,
    halfDay: user.halfDay,
    total: user.total,
    pct: user.total > 0 ? `${Math.round(((user.present + user.halfDay * 0.5) / user.total) * 100)}%` : '0%',
  }));
}

// ─── CSV generation ───────────────────────────────────────────────────────────

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function buildCsvString(headers: string[], rows: string[][]): string {
  const lines = [headers.map(escapeCsv).join(',')];
  rows.forEach((row) => lines.push(row.map(escapeCsv).join(',')));
  return lines.join('\n');
}

async function exportCsv(filename: string, csvContent: string) {
  try {
    const file = new File(Paths.cache, filename);
    file.write(csvContent);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: `Export ${filename}`,
      });
    } else {
      Alert.alert('Export', 'Sharing is not available on this device.');
    }
  } catch (error) {
    Alert.alert('Export Error', 'Failed to export the report.');
  }
}

// ─── Project type for report ──────────────────────────────────────────────────

interface ProjectRow {
  id: string;
  name: string;
  clientName: string;
  location: string;
  status: string;
  progressPercent: number;
  startDate: string;
  endDate: string | null;
  teamSize: number;
}

// ─── Request type for report ──────────────────────────────────────────────────

interface RequestRow {
  id: string;
  subject: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  employee: string;
  project: string;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ONGOING': return 'Ongoing';
    case 'COMPLETED': return 'Completed';
    case 'ON_HOLD': return 'On Hold';
    case 'UPCOMING': return 'Upcoming';
    case 'PENDING': return 'Pending';
    case 'APPROVED': return 'Approved';
    case 'REJECTED': return 'Rejected';
    default: return status;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportsScreen(): React.ReactElement {
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType>('Attendance');
  const [project, setProject] = useState<string | null>('all');
  const [range, setRange] = useState<string | null>('This Month');
  const [generated, setGenerated] = useState(false);

  // Compute date boundaries from selected range
  const dateRange = useMemo(() => getDateRange(range ?? 'This Month'), [range]);

  // ── Data hooks ────────────────────────────────────────────────────────────

  // Fetch real projects for filter dropdown + projects report
  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useAllProjects(1);

  // Build project options from real data with unique IDs
  const projectOptions: DropdownOption[] = [
    { id: 'all', label: 'All Projects' },
    ...(projectsData?.data.map((p) => ({
      id: p.id,
      label: p.name,
    })) ?? []),
  ];

  // Attendance data (date-filtered)
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
    isError: attendanceError,
  } = useAdminAttendance({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Fetch active employees for attendance report (to include zero-attendance employees)
  const {
    data: employeesData,
    isLoading: employeesLoading,
    refetch: refetchEmployees,
  } = useEmployees(1, 'ACTIVE');

  // Requests data
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch: refetchRequests,
    isError: requestsError,
  } = useAdminRequests();

  // ── Derived report data ───────────────────────────────────────────────────

  const attendanceRows = useMemo<AttendanceRow[]>(() => {
    if (!attendanceData) return [];

    // Filter employees to only include those created before or on the report end date
    const reportEndDate = new Date(dateRange.endDate);
    const relevantEmployees = employeesData?.data.filter((emp) => {
      const empCreatedDate = new Date(emp.createdAt);
      return empCreatedDate <= reportEndDate;
    }).map((emp) => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
    }));

    return calculateAttendanceRows(attendanceData, relevantEmployees);
  }, [attendanceData, employeesData, dateRange.endDate]);

  const projectRows = useMemo<ProjectRow[]>(() => {
    if (!projectsData?.data) return [];
    let filtered = projectsData.data;
    if (project && project !== 'all') {
      filtered = filtered.filter((p) => p.id === project);
    }
    return filtered.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.clientName ?? '—',
      location: p.location ?? '—',
      status: p.status ?? 'ONGOING',
      progressPercent: p.progressPercent ?? 0,
      startDate: p.startDate ?? '',
      endDate: p.endDate ?? null,
      teamSize: p.assignments?.length ?? 0,
    }));
  }, [projectsData, project]);

  const requestRows = useMemo<RequestRow[]>(() => {
    if (!requestsData) return [];
    let filtered = requestsData;
    if (project && project !== 'all') {
      filtered = filtered.filter((r) => r.projectId === project);
    }
    return filtered.map((r) => ({
      id: r.id,
      subject: r.subject,
      type: r.type === 'MATERIAL' ? 'Material' : 'Issue',
      priority: r.priority,
      status: r.status,
      createdAt: r.createdAt,
      employee: r.user ? `${r.user.firstName} ${r.user.lastName}` : '—',
      project: r.project?.name ?? '—',
    }));
  }, [requestsData, project]);

  // ── Loading / error state ─────────────────────────────────────────────────

  const isLoading =
    (reportType === 'Attendance' && (attendanceLoading || employeesLoading)) ||
    (reportType === 'Projects' && projectsLoading) ||
    (reportType === 'Requests' && requestsLoading);

  const isError =
    (reportType === 'Attendance' && attendanceError) ||
    (reportType === 'Requests' && requestsError);

  // ── Generate handler ──────────────────────────────────────────────────────

  const handleGenerate = useCallback(() => {
    setGenerated(true);
    if (reportType === 'Attendance') {
      refetchAttendance();
      refetchEmployees();
    }
    if (reportType === 'Projects') refetchProjects();
    if (reportType === 'Requests') refetchRequests();
  }, [reportType, refetchAttendance, refetchEmployees, refetchProjects, refetchRequests]);

  // ── Export CSV handler ────────────────────────────────────────────────────

  const handleExportCsv = useCallback(() => {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (reportType === 'Attendance') {
      if (attendanceRows.length === 0) {
        Alert.alert('Export', 'No attendance data to export.');
        return;
      }
      const headers = ['Employee', 'Present', 'Half Day', 'Total Records', 'Attendance %'];
      const rows = attendanceRows.map((r) => [
        r.name,
        String(r.present),
        String(r.halfDay),
        String(r.total),
        r.pct,
      ]);
      const csv = buildCsvString(headers, rows);
      exportCsv(`attendance-report-${timestamp}.csv`, csv);
    } else if (reportType === 'Projects') {
      if (projectRows.length === 0) {
        Alert.alert('Export', 'No project data to export.');
        return;
      }
      const headers = ['Project', 'Client', 'Location', 'Status', 'Progress %', 'Start Date', 'End Date', 'Team Size'];
      const rows = projectRows.map((p) => [
        p.name,
        p.clientName,
        p.location,
        getStatusLabel(p.status),
        String(p.progressPercent),
        formatDate(p.startDate),
        p.endDate ? formatDate(p.endDate) : '—',
        String(p.teamSize),
      ]);
      const csv = buildCsvString(headers, rows);
      exportCsv(`projects-report-${timestamp}.csv`, csv);
    } else if (reportType === 'Requests') {
      if (requestRows.length === 0) {
        Alert.alert('Export', 'No request data to export.');
        return;
      }
      const headers = ['Subject', 'Type', 'Project', 'Employee', 'Priority', 'Status', 'Date'];
      const rows = requestRows.map((r) => [
        r.subject,
        r.type,
        r.project,
        r.employee,
        r.priority,
        getStatusLabel(r.status),
        formatDate(r.createdAt),
      ]);
      const csv = buildCsvString(headers, rows);
      exportCsv(`requests-report-${timestamp}.csv`, csv);
    }
  }, [reportType, attendanceRows, projectRows, requestRows]);

  // ── When report type changes, reset generated state ───────────────────────

  const handleReportTypeChange = useCallback((t: ReportType) => {
    setReportType(t);
    setGenerated(false);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Icon name="back" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reports</Text>
        </View>

        {/* Report type chips */}
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
                  onPress={() => handleReportTypeChange(t)}
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
        >
          {/* Filters */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>FILTERS</Text>
            {reportType !== 'Attendance' && (
              <Dropdown label="Project" value={project} options={projectOptions} onSelect={setProject} />
            )}
            {reportType !== 'Projects' && (
              <Dropdown label="Date Range" value={range} options={RANGE_OPTIONS} onSelect={setRange} />
            )}
            <Button label="Generate Report" onPress={handleGenerate} />
          </Card>

          {/* Preview */}
          <Card noPadding style={styles.previewCard}>
            <Text style={styles.previewTitle}>
              {reportType} Report{generated ? ` — ${range ?? 'All Time'}` : ''}
            </Text>

            {!generated ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Select filters and tap "Generate Report" to view data.
                </Text>
              </View>
            ) : isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : isError ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.errorText}>Failed to load report data. Pull to retry.</Text>
              </View>
            ) : reportType === 'Attendance' ? (
              renderAttendanceTable(attendanceRows)
            ) : reportType === 'Projects' ? (
              renderProjectsTable(projectRows)
            ) : reportType === 'Requests' ? (
              renderRequestsTable(requestRows)
            ) : null}
          </Card>

          {/* Export button — CSV only */}
          {generated && (
            <View style={styles.exportRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.exportBtn, styles.csvBtn]}
                onPress={handleExportCsv}
              >
                <Text style={styles.csvText}>⬇ Export CSV</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <AdminBottomNav activeIndex={4} />
      </SafeAreaView>
    </>
  );
}

// ─── Attendance Table ─────────────────────────────────────────────────────────

function renderAttendanceTable(rows: AttendanceRow[]) {
  if (rows.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No attendance records for the selected period.</Text>
      </View>
    );
  }

  const totalPresent = rows.reduce((s, r) => s + r.present, 0);
  const totalHalfDay = rows.reduce((s, r) => s + r.halfDay, 0);
  const totalRecords = rows.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <View style={[styles.tableRow, styles.tableHead]}>
        <Text style={[styles.th, styles.colName]}>Employee</Text>
        <Text style={[styles.th, styles.colNum]}>P</Text>
        <Text style={[styles.th, styles.colNum]}>H</Text>
        <Text style={[styles.th, styles.colPct]}>%</Text>
      </View>

      {rows.map((r) => (
        <View key={r.userId} style={styles.tableRow}>
          <Text style={[styles.td, styles.colName]} numberOfLines={1}>
            {r.name}
          </Text>
          <Text style={[styles.td, styles.colNum, { color: Colors.success }]}>
            {r.present}
          </Text>
          <Text style={[styles.td, styles.colNum, { color: Colors.warning }]}>
            {r.halfDay}
          </Text>
          <Text style={[styles.tdBold, styles.colPct]}>{r.pct}</Text>
        </View>
      ))}

      <View style={[styles.tableRow, styles.tableFooter]}>
        <Text style={[styles.tdBold, styles.colName]}>Total</Text>
        <Text style={[styles.tdBold, styles.colNum]}>{totalPresent}</Text>
        <Text style={[styles.tdBold, styles.colNum]}>{totalHalfDay}</Text>
        <Text style={[styles.tdBold, styles.colPct]}>{totalRecords} rec</Text>
      </View>
    </>
  );
}

// ─── Projects Table ───────────────────────────────────────────────────────────

function renderProjectsTable(rows: ProjectRow[]) {
  if (rows.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No projects found.</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.tableRow, styles.tableHead]}>
        <Text style={[styles.th, { flex: 2 }]}>Project</Text>
        <Text style={[styles.th, styles.colStatus]}>Status</Text>
        <Text style={[styles.th, styles.colNum]}>%</Text>
        <Text style={[styles.th, styles.colNum]}>Team</Text>
      </View>

      {rows.map((p) => (
        <View key={p.id} style={styles.tableRow}>
          <View style={{ flex: 2 }}>
            <Text style={styles.td} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.tdSub} numberOfLines={1}>{p.clientName}</Text>
          </View>
          <Text style={[styles.td, styles.colStatus]}>{getStatusLabel(p.status)}</Text>
          <Text style={[styles.tdBold, styles.colNum]}>{p.progressPercent}</Text>
          <Text style={[styles.td, styles.colNum]}>{p.teamSize}</Text>
        </View>
      ))}

      <View style={[styles.tableRow, styles.tableFooter]}>
        <Text style={[styles.tdBold, { flex: 2 }]}>{rows.length} project{rows.length !== 1 ? 's' : ''}</Text>
        <Text style={[styles.tdBold, styles.colStatus]} />
        <Text style={[styles.tdBold, styles.colNum]} />
        <Text style={[styles.tdBold, styles.colNum]} />
      </View>
    </>
  );
}

// ─── Requests Table ───────────────────────────────────────────────────────────

function renderRequestsTable(rows: RequestRow[]) {
  if (rows.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No requests found for the selected period.</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.tableRow, styles.tableHead]}>
        <Text style={[styles.th, { flex: 2 }]}>Subject</Text>
        <Text style={[styles.th, styles.colStatus]}>Type</Text>
        <Text style={[styles.th, styles.colStatus]}>Status</Text>
      </View>

      {rows.map((r) => (
        <View key={r.id} style={styles.tableRow}>
          <View style={{ flex: 2 }}>
            <Text style={styles.td} numberOfLines={1}>{r.subject}</Text>
            <Text style={styles.tdSub} numberOfLines={1}>{r.employee} · {r.project}</Text>
          </View>
          <Text style={[styles.td, styles.colStatus]}>{r.type}</Text>
          <Text style={[styles.td, styles.colStatus]}>{getStatusLabel(r.status)}</Text>
        </View>
      ))}

      <View style={[styles.tableRow, styles.tableFooter]}>
        <Text style={[styles.tdBold, { flex: 2 }]}>{rows.length} request{rows.length !== 1 ? 's' : ''}</Text>
        <Text style={[styles.tdBold, styles.colStatus]} />
        <Text style={[styles.tdBold, styles.colStatus]} />
      </View>
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
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.danger,
    textAlign: 'center',
  },

  // Top app bar
  header: {
    backgroundColor: Colors.primary,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
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
  typeChip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  typeChipTextActive: { color: Colors.textOnPrimary },

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },
  section: { gap: Spacing[3] },

  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },

  // Preview card
  previewCard: { overflow: 'hidden' },
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
  tableFooter: {
    backgroundColor: withAlpha(Colors.primary, 0.06),
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  // Table text
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
  tdSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  colName: { flex: 1, textAlign: 'left' },
  colNum: { width: 40, textAlign: 'center' },
  colPct: { width: 52, textAlign: 'right' },
  colStatus: { width: 64, textAlign: 'center' },

  // Export button
  exportRow: { flexDirection: 'row', gap: Spacing[3] },
  exportBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.btn,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  csvBtn: { borderColor: Colors.success, backgroundColor: Colors.surface },
  csvText: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.success },
});
