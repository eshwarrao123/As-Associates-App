import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
import { useEmployee, useEmployeeProjects, useUpdateEmployeeStatus } from '../../../src/hooks/useEmployees';
import { getErrorMessage } from '../../../src/services/api/errorHandler';

// Map project status to BadgeVariant
function mapProjectStatusToBadge(status: string): BadgeVariant {
  switch (status) {
    case 'ACTIVE':
      return 'approved';
    case 'COMPLETED':
      return 'completed';
    case 'ON_HOLD':
      return 'pending';
    default:
      return 'pending';
  }
}

// Attendance value → color (placeholder for future implementation)
function attendanceColor(att: string): string {
  const n = parseInt(att, 10);
  if (n >= 80) return Colors.success;
  if (n >= 60) return Colors.accent;
  return Colors.danger;
}

// Helper to get initials from name
function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeDetailScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch employee data
  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(id ?? '');
  const { data: projects, isLoading: isLoadingProjects } = useEmployeeProjects(id ?? '');
  const updateStatus = useUpdateEmployeeStatus();

  if (isLoadingEmployee) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
              <Icon name="back" size="lg" color={Colors.textOnPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Employee Details</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
          <AdminBottomNav activeIndex={3} />
        </SafeAreaView>
      </>
    );
  }

  if (!employee) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
              <Icon name="back" size="lg" color={Colors.textOnPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Employee Details</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Employee not found.</Text>
          </View>
          <AdminBottomNav activeIndex={3} />
        </SafeAreaView>
      </>
    );
  }

  const isActive = employee.status === 'ACTIVE';
  const initials = getInitials(employee.firstName, employee.lastName);
  const fullName = `${employee.firstName} ${employee.lastName}`;

  // Map projects to display format
  const assignedProjects = projects?.slice(0, 3).map((p) => ({
    id: p.id,
    name: p.name,
    status: mapProjectStatusToBadge(p.status),
    statusLabel: p.status === 'ACTIVE' ? 'Active' : p.status === 'COMPLETED' ? 'Completed' : 'On Hold',
  })) ?? [];

  const handleStatusToggle = () => {
    const newStatus = isActive ? 'DEACTIVATED' : 'ACTIVE';
    const actionText = isActive ? 'deactivate' : 'activate';

    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Employee`,
      `Are you sure you want to ${actionText} ${fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: isActive ? 'destructive' : 'default',
          onPress: () => {
            updateStatus.mutate(
              { id: id ?? '', status: newStatus },
              {
                onSuccess: (result) => {
                  if (result.tempCredential) {
                    Alert.alert(
                      'Employee Activated',
                      `Temporary Password: ${result.tempCredential}\n\nShare this with the employee so they can log in.`,
                      [{ text: 'OK' }],
                    );
                  } else {
                    Alert.alert('Success', 'Employee status updated.');
                  }
                },
                onError: (error) => {
                  Alert.alert('Error', getErrorMessage(error));
                },
              },
            );
          },
        },
      ],
    );
  };

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
            <Avatar initials={initials} size="lg" bgColor={Colors.primary} />
            <View style={styles.profileMeta}>
              <Text style={styles.empName}>{fullName}</Text>
              <Text style={styles.empDesignation}>{employee.designation ?? 'No designation'}</Text>
              <Text style={styles.empIdText}>{employee.employeeCode ?? 'N/A'}</Text>
            </View>
            <Badge
              variant={isActive ? 'approved' : 'rejected'}
              label={isActive ? 'Active' : 'Inactive'}
            />
          </Card>

          {/* ── Section 2: Stats row ────────────────────────────────────── */}
          <Card style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{projects?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { color: Colors.textMuted }]}>
                N/A
              </Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Uploads</Text>
            </View>
          </Card>

          {/* ── Section 3: Contact Info ─────────────────────────────────── */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>CONTACT INFO</Text>
            {employee.phone && (
              <>
                <View style={styles.infoRow}>
                  <Icon name="phone" size="md" color={Colors.textSecondary} />
                  <Text style={styles.infoText}>{employee.phone}</Text>
                </View>
                {employee.email && <View style={styles.divider} />}
              </>
            )}
            {employee.email && (
              <View style={styles.infoRow}>
                <Icon name="email" size="md" color={Colors.textSecondary} />
                <Text style={styles.infoText}>{employee.email}</Text>
              </View>
            )}
            {!employee.phone && !employee.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>No contact information available.</Text>
              </View>
            )}
          </Card>

          {/* ── Section 4: Assigned Projects ────────────────────────────── */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>ASSIGNED PROJECTS</Text>
            {isLoadingProjects ? (
              <View style={styles.infoRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : assignedProjects.length === 0 ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>No projects assigned yet.</Text>
              </View>
            ) : (
              <>
                {assignedProjects.map((p, i) => (
                  <React.Fragment key={p.id}>
                    <View style={styles.projectRow}>
                      <Text style={styles.projectName} numberOfLines={1}>{p.name}</Text>
                      <Badge variant={p.status} label={p.statusLabel} />
                    </View>
                    {i < assignedProjects.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
                {(projects?.length ?? 0) > 3 && (
                  <>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push(`/(admin)/employees/${id}/projects` as never)}
                      style={styles.viewAllRow}
                    >
                      <Text style={styles.viewAllText}>View All Projects</Text>
                      <Icon name="chevronRight" size="sm" color={Colors.primary} />
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </Card>

          {/* ── Section 5: Actions ──────────────────────────────────────── */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>ACTIONS</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionRow}
              onPress={() => router.push(`/(admin)/employees/${id}/edit` as never)}
              disabled={updateStatus.isPending}
            >
              <Text style={styles.actionLabel}>Edit Employee</Text>
              <Icon name="chevronRight" size="md" color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionRow}
              onPress={handleStatusToggle}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? (
                <ActivityIndicator size="small" color={Colors.danger} />
              ) : (
                <>
                  <Text style={[styles.actionLabel, isActive ? styles.dangerText : styles.successText]}>
                    {isActive ? 'Deactivate Account' : 'Activate Account'}
                  </Text>
                  <Icon name="chevronRight" size="md" color={isActive ? Colors.danger : Colors.success} />
                </>
              )}
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
  successText: { color: Colors.success },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
