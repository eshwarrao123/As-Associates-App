import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Button } from '../../../src/components/ui/Button';
import { useEmployees } from '../../../src/hooks/useEmployees';
import { useAssignEmployees } from '../../../src/hooks/useAdminProjects';
import { getErrorMessage } from '../../../src/services/api/errorHandler';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  withAlpha,
} from '../../../src/constants/tokens';

// ─── Employee type from API ────────────────────────────────────────────────────

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeCode?: string;
  designation?: string;
  status: 'PENDING' | 'ACTIVE' | 'DEACTIVATED';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssignEngineersScreen(): React.ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Fetch real employees from API
  const { data: employeesData, isLoading } = useEmployees(1);
  const allEmployees = employeesData?.data ?? [];

  // Assign employees mutation
  const assignEmployees = useAssignEmployees();

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const filtered = allEmployees.filter((e: Employee) => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    const searchLower = search.trim().toLowerCase();
    return (
      fullName.includes(searchLower) ||
      e.email.toLowerCase().includes(searchLower) ||
      e.employeeCode?.toLowerCase().includes(searchLower)
    );
  });

  const handleConfirmAssignment = () => {
    if (!projectId) {
      Alert.alert('Error', 'Project ID is missing');
      return;
    }

    if (selected.length === 0) {
      Alert.alert('Error', 'Please select at least one engineer');
      return;
    }

    assignEmployees.mutate(
      { projectId, employeeIds: selected },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Engineers assigned successfully!');
          router.back();
        },
        onError: (error) => {
          Alert.alert('Error', getErrorMessage(error));
        },
      }
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — navy, flat */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assign Engineers</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search engineers..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
        </View>

        {/* Selected count label */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {selected.length} engineer{selected.length !== 1 ? 's' : ''} selected
          </Text>
        </View>

        {/* Loading state */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading engineers...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search ? 'No engineers found matching your search' : 'No engineers available'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.id);
              const initials = `${item.firstName[0]}${item.lastName[0]}`.toUpperCase();
              const fullName = `${item.firstName} ${item.lastName}`;
              const role = item.designation ?? 'Employee';

              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggle(item.id)}
                  style={[styles.row, isSelected && styles.rowSelected]}
                >
                  <Avatar initials={initials} size="md" />
                  <View style={styles.rowText}>
                    <Text style={styles.name}>{fullName}</Text>
                    <Text style={styles.role}>{role}</Text>
                  </View>
                  {/* Selection indicator — filled navy with checkmark when selected */}
                  <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Confirm button — fixed above safe-area bottom */}
        <View style={styles.footer}>
          <Button
            label={assignEmployees.isPending ? 'Assigning...' : 'Confirm Assignment'}
            onPress={handleConfirmAssignment}
            disabled={assignEmployees.isPending || selected.length === 0}
          />
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
  },
  back: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textOnPrimary,
    lineHeight: 30,
  },
  // headline-sm: 18px / bold
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },
  headerSpacer: { width: 20 },

  // Search field — matches Input spec: 48px, 1px border, 8px radius, 14px padding
  searchWrap: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
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

  // Selected count — label-sm: 12px / 500 / muted
  countRow: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.background,
  },
  countText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  list: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    paddingBottom: Spacing[4],
  },
  sep: { height: 1, backgroundColor: Colors.border },

  // List item — list item pattern per DESIGN.md §14: 12px vertical padding
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.btn,
  },
  rowSelected: {
    backgroundColor: withAlpha(Colors.primary, 0.05),
    paddingHorizontal: Spacing[2],
    marginHorizontal: -Spacing[2],
  },
  rowText: { flex: 1 },
  // List item title — body-lg: 16px / medium for name
  name: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  // List item subtitle — body-md: 14px / regular
  role: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Selection indicator — 24px circle, navy fill + white checkmark when selected
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
    lineHeight: FontSize.sm * 1.2,
  },

  // Footer — white surface, top border, padding for the button
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  loadingText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
