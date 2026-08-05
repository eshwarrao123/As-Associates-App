import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../../src/constants/tokens';
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
  { id: '1', name: 'Rahul Kumar', initials: 'RK', empId: 'ASA-2024-047', designation: 'Site Engineer', active: true, projects: 4, attendance: '87%' },
  { id: '2', name: 'Anita Sharma', initials: 'AS', empId: 'ASA-2024-051', designation: 'Civil Engineer', active: true, projects: 3, attendance: '92%' },
  { id: '3', name: 'Vikram Patel', initials: 'VP', empId: 'ASA-2023-018', designation: 'Electrical Engineer', active: true, projects: 5, attendance: '78%' },
  { id: '4', name: 'Priya Joshi', initials: 'PJ', empId: 'ASA-2022-009', designation: 'Project Lead', active: true, projects: 2, attendance: '95%' },
  { id: '5', name: 'Manish Rao', initials: 'MR', empId: 'ASA-2024-063', designation: 'Junior Engineer', active: false, projects: 1, attendance: '64%' },
];

type Filter = 'All' | 'Active' | 'Inactive';
const FILTERS: Filter[] = ['All', 'Active', 'Inactive'];

const STATUS_BADGE: Record<'active' | 'inactive', { variant: BadgeVariant; label: string }> = {
  active: { variant: 'approved', label: 'Active' },
  inactive: { variant: 'rejected', label: 'Inactive' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeesScreen(): React.ReactElement {
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
        {/* Navy header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Employees</Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add Employee</Text>
          </TouchableOpacity>
        </View>

        {/* Search + filters */}
        <View style={styles.controls}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search employees..."
            placeholderTextColor={Colors.textSecondary}
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
            <Card style={styles.empCard}>
              <View style={styles.empTop}>
                <Avatar initials={item.initials} size="md" />
                <View style={styles.flex1}>
                  <View style={styles.empNameRow}>
                    <Text style={styles.empName} numberOfLines={1}>{item.name}</Text>
                    <Badge {...STATUS_BADGE[item.active ? 'active' : 'inactive']} />
                  </View>
                  <Text style={styles.empId}>{item.empId}</Text>
                  <Text style={styles.empRole}>{item.designation}</Text>
                </View>
              </View>
              <View style={styles.empStats}>
                <View style={styles.statChip}>
                  <Text style={styles.statChipValue}>{item.projects}</Text>
                  <Text style={styles.statChipLabel}>Projects</Text>
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statChipValue}>{item.attendance}</Text>
                  <Text style={styles.statChipLabel}>Attendance</Text>
                </View>
              </View>
            </Card>
          )}
        />

        <AdminBottomNav activeIndex={2} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },

  header: {
    backgroundColor: Colors.primary,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
  },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.surface },
  addBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.accent },
  addBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.surface },

  controls: {
    backgroundColor: Colors.surface,
    padding: Spacing[3],
    gap: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  filterRow: { flexDirection: 'row', gap: Spacing[2] },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontFamily: FontFamily.medium, fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.surface },

  list: { padding: Spacing[4] },
  sep: { height: Spacing[3] },

  empCard: { gap: Spacing[3] },
  empTop: { flexDirection: 'row', gap: Spacing[3] },
  empNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing[2] },
  empName: { flex: 1, fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  empId: { fontFamily: FontFamily.medium, fontSize: 12, color: Colors.accent, marginTop: 2 },
  empRole: { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

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
  statChipValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.primary },
  statChipLabel: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },
});
