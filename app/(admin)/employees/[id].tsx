import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { Icon } from '../../../src/components/ui/Icon';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import {
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
  BorderRadius,
  withAlpha,
} from '../../../src/constants/tokens';
import type { BadgeVariant } from '../../../src/types';

// ─── Mock data (mirrors employees/index.tsx) ──────────────────────────────────

interface AssignedProject {
  id: string;
  name: string;
  status: BadgeVariant;
  statusLabel: string;
}

interface EmployeeDetail {
  id: string;
  name: string;
  initials: string;
  empId: string;
  designation: string;
  active: boolean;
  projects: number;
  attendance: string;
  uploads: number;
  phone: string;
  email: string;
  assignedProjects: AssignedProject[];
}

const EMPLOYEES: EmployeeDetail[] = [
  {
    id: '1',
    name: 'Rahul Kumar',
    initials: 'RK',
    empId: 'ASA-2024-047',
    designation: 'Site Engineer',
    active: true,
    projects: 4,
    attendance: '87%',
    uploads: 23,
    phone: '+91 98765 43210',
    email: 'rahul.kumar@asassociates.com',
    assignedProjects: [
      { id: 'p1', name: 'City Center Plaza',     status: 'approved', statusLabel: 'Active' },
      { id: 'p2', name: 'Riverside Apartments',  status: 'pending',  statusLabel: 'On Hold' },
      { id: 'p3', name: 'Tech Park Hub',          status: 'approved', statusLabel: 'Active' },
    ],
  },
  {
    id: '2',
    name: 'Anita Sharma',
    initials: 'AS',
    empId: 'ASA-2024-051',
    designation: 'Civil Engineer',
    active: true,
    projects: 3,
    attendance: '92%',
    uploads: 41,
    phone: '+91 91234 56789',
    email: 'anita.sharma@asassociates.com',
    assignedProjects: [
      { id: 'p1', name: 'City Center Plaza',     status: 'approved', statusLabel: 'Active' },
      { id: 'p4', name: 'Metro Transit Hub',      status: 'pending',  statusLabel: 'Planning' },
    ],
  },
  {
    id: '3',
    name: 'Vikram Patel',
    initials: 'VP',
    empId: 'ASA-2023-018',
    designation: 'Electrical Engineer',
    active: true,
    projects: 5,
    attendance: '78%',
    uploads: 18,
    phone: '+91 99887 76655',
    email: 'vikram.patel@asassociates.com',
    assignedProjects: [
      { id: 'p2', name: 'Riverside Apartments',  status: 'approved', statusLabel: 'Active' },
      { id: 'p3', name: 'Tech Park Hub',          status: 'approved', statusLabel: 'Active' },
    ],
  },
  {
    id: '4',
    name: 'Priya Joshi',
    initials: 'PJ',
    empId: 'ASA-2022-009',
    designation: 'Project Lead',
    active: true,
    projects: 2,
    attendance: '95%',
    uploads: 57,
    phone: '+91 90011 22334',
    email: 'priya.joshi@asassociates.com',
    assignedProjects: [
      { id: 'p3', name: 'Tech Park Hub',          status: 'approved', statusLabel: 'Active' },
      { id: 'p5', name: 'Harbour View Complex',   status: 'pending',  statusLabel: 'Planning' },
    ],
  },
  {
    id: '5',
    name: 'Manish Rao',
    initials: 'MR',
    empId: 'ASA-2024-063',
    designation: 'Junior Engineer',
    active: false,
    projects: 1,
    attendance: '64%',
    uploads: 7,
    phone: '+91 88001 23456',
    email: 'manish.rao@asassociates.com',
    assignedProjects: [
      { id: 'p2', name: 'Riverside Apartments',  status: 'pending',  statusLabel: 'On Hold' },
    ],
  },
];

// Attendance value → color
function attendanceColor(att: string): string {
  const n = parseInt(att, 10);
  if (n >= 80) return Colors.success;
  if (n >= 60) return Colors.accent;
  return Colors.danger;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeDetailScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const employee = EMPLOYEES.find((e) => e.id === id) ?? EMPLOYEES[0];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — navy, flat */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Icon name="back" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Employee Details</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Section 1: Profile header ──────────────────────────────── */}
          <Card style={styles.profileCard}>
            <Avatar initials={employee.initials} size="lg" bgColor={Colors.primary} />
            <View style={styles.profileMeta}>
              <Text style={styles.empName}>{employee.name}</Text>
              <Text style={styles.empDesignation}>{employee.designation}</Text>
              <Text style={styles.empIdText}>{employee.empId}</Text>
            </View>
            <Badge
              variant={employee.active ? 'approved' : 'default'}
              label={employee.active ? 'Active' : 'Inactive'}
            />
          </Card>

          {/* ── Section 2: Stats row ────────────────────────────────────── */}
          <Card style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{employee.projects}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { color: attendanceColor(employee.attendance) }]}>
                {employee.attendance}
              </Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{employee.uploads}</Text>
              <Text style={styles.statLabel}>Uploads</Text>
            </View>
          </Card>

          {/* ── Section 3: Contact Info ─────────────────────────────────── */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>CONTACT INFO</Text>
            <View style={styles.infoRow}>
              <Icon name="phone" size="md" color={Colors.textSecondary} />
              <Text style={styles.infoText}>{employee.phone}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="email" size="md" color={Colors.textSecondary} />
              <Text style={styles.infoText}>{employee.email}</Text>
            </View>
          </Card>

          {/* ── Section 4: Assigned Projects ────────────────────────────── */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>ASSIGNED PROJECTS</Text>
            {employee.assignedProjects.map((p, i) => (
              <React.Fragment key={p.id}>
                <View style={styles.projectRow}>
                  <Text style={styles.projectName} numberOfLines={1}>{p.name}</Text>
                  <Badge variant={p.status} label={p.statusLabel} />
                </View>
                {i < employee.assignedProjects.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
            <View style={styles.divider} />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/(admin)/employees/${id}/projects` as never)}
              style={styles.viewAllRow}
            >
              <Text style={styles.viewAllText}>View All Projects</Text>
              <Icon name="chevronRight" size="sm" color={Colors.primary} />
            </TouchableOpacity>
          </Card>

          {/* ── Section 5: Actions ──────────────────────────────────────── */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>ACTIONS</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.actionRow} onPress={() => router.push(`/(admin)/employees/${id}/edit` as never)}>
              <Text style={styles.actionLabel}>Edit Employee</Text>
              <Icon name="chevronRight" size="md" color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity activeOpacity={0.7} style={styles.actionRow}>
              <Text style={[styles.actionLabel, styles.dangerText]}>Deactivate Account</Text>
              <Icon name="chevronRight" size="md" color={Colors.danger} />
            </TouchableOpacity>
          </Card>
        </ScrollView>

        <AdminBottomNav activeIndex={3} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },

  // Profile card — row: avatar | meta | badge
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  profileMeta: { flex: 1, gap: 2 },
  empName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  empDesignation: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  empIdText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.accent,
    marginTop: 2,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[1],
  },
  statCell: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  // Generic info/link card
  linkCard: { paddingVertical: Spacing[3] },
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[2],
  },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing[4] },

  // Contact rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  infoText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  // Project rows
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  projectName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[3],
  },
  viewAllText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.primary,
  },

  // Action rows
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  actionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  dangerText: { color: Colors.danger },
});
