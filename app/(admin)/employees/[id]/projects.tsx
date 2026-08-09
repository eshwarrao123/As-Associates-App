import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

// ─── Mock data ────────────────────────────────────────────────────────────────

interface EmployeeMeta {
  id: string;
  name: string;
}

const EMPLOYEE_NAMES: EmployeeMeta[] = [
  { id: '1', name: 'Rahul Kumar' },
  { id: '2', name: 'Anita Sharma' },
  { id: '3', name: 'Vikram Patel' },
  { id: '4', name: 'Priya Joshi' },
  { id: '5', name: 'Manish Rao' },
];

interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  progress: number;
  status: BadgeVariant;
  statusLabel: string;
  assignedIds: string[];
}

const ALL_PROJECTS: Project[] = [
  {
    id: 'p1', name: 'City Center Plaza',
    client: 'ICICI Bank', location: 'Mumbai, MH',
    progress: 75, status: 'approved', statusLabel: 'Active',
    assignedIds: ['1', '2'],
  },
  {
    id: 'p2', name: 'Riverside Apartments',
    client: 'Axis Bank', location: 'Pune, MH',
    progress: 30, status: 'pending', statusLabel: 'On Hold',
    assignedIds: ['1', '3', '5'],
  },
  {
    id: 'p3', name: 'Tech Park Hub',
    client: 'HDFC Bank', location: 'Powai, MH',
    progress: 92, status: 'approved', statusLabel: 'Active',
    assignedIds: ['1', '3', '4'],
  },
  {
    id: 'p4', name: 'Metro Transit Hub',
    client: 'SBI', location: 'Thane, MH',
    progress: 15, status: 'pending', statusLabel: 'Planning',
    assignedIds: ['2', '4'],
  },
  {
    id: 'p5', name: 'Harbour View Complex',
    client: 'Kotak Bank', location: 'Nariman Point, MH',
    progress: 48, status: 'pending', statusLabel: 'Planning',
    assignedIds: ['4'],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeProjectsScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const employee = EMPLOYEE_NAMES.find((e) => e.id === id) ?? EMPLOYEE_NAMES[0];
  const projects = ALL_PROJECTS.filter((p) => p.assignedIds.includes(id ?? ''));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Icon name="back" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {employee.name}'s Projects
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.countLabel}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} assigned
          </Text>

          {projects.map((p) => (
            <Card key={p.id} style={styles.projectCard}>
              <View style={styles.cardTop}>
                <Text style={styles.projectName} numberOfLines={1}>{p.name}</Text>
                <Badge variant={p.status} label={p.statusLabel} />
              </View>

              <View style={styles.metaRow}>
                <Icon name="clientOutline" size="sm" color={Colors.textMuted} />
                <Text style={styles.metaText}>{p.client}</Text>
              </View>
              <View style={styles.metaRow}>
                <Icon name="locationOutline" size="sm" color={Colors.textMuted} />
                <Text style={styles.metaText}>{p.location}</Text>
              </View>

              <View style={styles.progressRow}>
                <ProgressBar
                  value={p.progress}
                  showLabel={false}
                  fillColor={Colors.primary}
                  style={styles.bar}
                />
                <Text style={styles.pct}>{p.progress}%</Text>
              </View>
            </Card>
          ))}

          {projects.length === 0 && (
            <Text style={styles.emptyText}>No projects assigned to this employee.</Text>
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
});
