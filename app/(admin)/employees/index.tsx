import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  Spacing,
} from '../../../src/constants/tokens';
import type { BadgeVariant } from '../../../src/types';

// ─── Types & mock data ────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string;
  initials: string;
  empId: string;
  designation: string;
  active: boolean;
  projects: number;
  attendance: string;
}

const EMPLOYEES: Employee[] = [
  { id: '1', name: 'Rahul Kumar',   initials: 'RK', empId: 'ASA-2024-047', designation: 'Site Engineer',         active: true,  projects: 4, attendance: '87%' },
  { id: '2', name: 'Anita Sharma',  initials: 'AS', empId: 'ASA-2024-051', designation: 'Civil Engineer',         active: true,  projects: 3, attendance: '92%' },
  { id: '3', name: 'Vikram Patel',  initials: 'VP', empId: 'ASA-2023-018', designation: 'Electrical Engineer',    active: true,  projects: 5, attendance: '78%' },
  { id: '4', name: 'Priya Joshi',   initials: 'PJ', empId: 'ASA-2022-009', designation: 'Project Lead',           active: true,  projects: 2, attendance: '95%' },
  { id: '5', name: 'Manish Rao',    initials: 'MR', empId: 'ASA-2024-063', designation: 'Junior Engineer',        active: false, projects: 1, attendance: '64%' },
];

type Filter = 'All' | 'Active' | 'Inactive';
const FILTERS: Filter[] = ['All', 'Active', 'Inactive'];

const STATUS_BADGE: Record<'active' | 'inactive', { variant: BadgeVariant; label: string }> = {
  active:   { variant: 'approved', label: 'Active' },
  inactive: { variant: 'rejected', label: 'Inactive' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeesScreen(): React.ReactElement {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const filtered = EMPLOYEES.filter((e) => {
    const matchFilter =
      filter === 'All' || (filter === 'Active' ? e.active : !e.active);
    const matchSearch = e.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — navy, flat */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Employees</Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.addBtn} onPress={() => router.push('/(admin)/employees/new' as never)}>
            <Text style={styles.addBtnText}>+ Add Employee</Text>
          </TouchableOpacity>
        </View>

        {/* Search + filter chips */}
        <View style={styles.controls}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search employees..."
            placeholderTextColor={Colors.textMuted}
          />
          <View style={styles.filterRow}>
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
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/(admin)/employees/${item.id}` as never)}>
            <Card style={styles.empCard}>
              <View style={styles.empTop}>
                <Avatar initials={item.initials} size="md" />
                <View style={styles.flex1}>
                  <View style={styles.empNameRow}>
                    <Text style={styles.empName} numberOfLines={1}>{item.name}</Text>
                    <Badge {...STATUS_BADGE[item.active ? 'active' : 'inactive']} />
                  </View>
                  {/* Employee ID — caption / metadata, not an action */}
                  <Text style={styles.empId}>{item.empId}</Text>
                  <Text style={styles.empRole}>{item.designation}</Text>
                </View>
              </View>
              <View style={styles.empStats}>
                <View style={styles.statChip}>
                  {/* body-lg: 16px / bold for the number */}
                  <Text style={styles.statChipValue}>{item.projects}</Text>
                  <Text style={styles.statChipLabel}>Projects</Text>
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statChipValue}>{item.attendance}</Text>
                  <Text style={styles.statChipLabel}>Attendance</Text>
                </View>
              </View>
            </Card>
            </TouchableOpacity>
          )}
        />

        <AdminBottomNav activeIndex={3} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },

  // Top app bar — 56px, navy, flat (no shadow per DESIGN.md §11)
  header: {
    backgroundColor: Colors.primary,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
  },
  // headline-sm: 18px / bold
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },
  // Primary amber button — 8px radius, label-md (14px / 500)
  addBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.accent,
  },
  addBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textOnAccent,
  },

  // Controls bar — search + filter chips
  controls: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // Input spec: 48px height, 1px border, 8px radius, 14px padding (DESIGN.md §7)
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  filterRow: { flexDirection: 'row', gap: Spacing[2] },
  // Filter chips — pill shape, navy fill when active
  chip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  // label-md: 14px / 500
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  chipTextActive: { color: Colors.textOnPrimary },

  // 16px outer padding, 12px between cards
  list: { padding: Spacing[4] },
  sep: { height: Spacing[3] },

  empCard: { gap: Spacing[3] },
  empTop: { flexDirection: 'row', gap: Spacing[3] },
  empNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  // List item title — body-lg: 16px / bold for name
  empName: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  // Employee ID — caption / metadata: label-sm 12px / muted
  empId: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  // Designation — body-md: 14px / 400
  empRole: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Stat chips — two equal columns
  empStats: { flexDirection: 'row', gap: Spacing[2] },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.background,
  },
  // Large number — body-lg: 16px / bold
  statChipValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  // Label — label-sm: 12px / regular
  statChipLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
