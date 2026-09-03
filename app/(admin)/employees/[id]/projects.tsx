import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../../../src/components/ui/Badge';
import { Card } from '../../../../src/components/ui/Card';
import { Icon } from '../../../../src/components/ui/Icon';
import { ProgressBar } from '../../../../src/components/ui/ProgressBar';
import { AdminBottomNav } from '../../../../src/components/ui/AdminBottomNav';
import {
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
} from '../../../../src/constants/tokens';
import type { BadgeVariant } from '../../../../src/types';
import { useEmployee, useEmployeeProjects } from '../../../../src/hooks/useEmployees';

// Map project status to BadgeVariant
function mapProjectStatusToBadge(status: string): BadgeVariant {
  switch (status) {
    case 'ONGOING':
      return 'ongoing';
    case 'COMPLETED':
      return 'completed';
    case 'ON_HOLD':
      return 'onhold';
    case 'UPCOMING':
      return 'upcoming';
    default:
      return 'pending';
  }
}

// Get status label
function getStatusLabel(status: string): string {
  switch (status) {
    case 'ONGOING':
      return 'Ongoing';
    case 'COMPLETED':
      return 'Completed';
    case 'ON_HOLD':
      return 'On Hold';
    case 'UPCOMING':
      return 'Upcoming';
    default:
      return 'Unknown';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeProjectsScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch employee and projects data
  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(id ?? '');
  const { data: projects, isLoading: isLoadingProjects } = useEmployeeProjects(id ?? '');

  const employeeName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : 'Employee';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Icon name="back" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {employeeName}'s Projects
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {isLoadingProjects ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : !projects || projects.length === 0 ? (
            <>
              <Text style={styles.countLabel}>0 projects assigned</Text>
              <Text style={styles.emptyText}>No projects assigned to this employee.</Text>
            </>
          ) : (
            <>
              <Text style={styles.countLabel}>
                {projects.length} project{projects.length !== 1 ? 's' : ''} assigned
              </Text>

              {projects.map((p) => (
                <Card key={p.id} style={styles.projectCard}>
                  <View style={styles.cardTop}>
                    <Text style={styles.projectName} numberOfLines={1}>{p.name}</Text>
                    <Badge
                      variant={mapProjectStatusToBadge(p.status)}
                      label={getStatusLabel(p.status)}
                    />
                  </View>
                </Card>
              ))}
            </>
          )}
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
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },

  countLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing[1],
  },

  projectCard: { gap: Spacing[2] },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  projectName: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginTop: Spacing[1] },
  bar: { flex: 1 },
  pct: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.primary,
    minWidth: 34,
    textAlign: 'right',
  },

  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing[8],
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[8],
  },
});
