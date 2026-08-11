import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Button } from '../../../src/components/ui/Button';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  withAlpha,
} from '../../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

interface Engineer {
  id: string;
  name: string;
  initials: string;
  role: string;
}

const ALL_ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Rahul Kumar',   initials: 'RK', role: 'Site Engineer' },
  { id: 'e2', name: 'Anita Sharma',  initials: 'AS', role: 'Civil Engineer' },
  { id: 'e3', name: 'Vikram Patel',  initials: 'VP', role: 'Electrical Engineer' },
  { id: 'e4', name: 'Priya Joshi',   initials: 'PJ', role: 'Project Lead' },
  { id: 'e5', name: 'Manoj Reddy',   initials: 'MR', role: 'HVAC Engineer' },
  { id: 'e6', name: 'Sunita Verma',  initials: 'SV', role: 'Interior Designer' },
];

// e1, e2, e3 are already on this project
const INITIAL_SELECTED = ['e1', 'e2', 'e3'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssignEngineersScreen(): React.ReactElement {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(INITIAL_SELECTED);
  const [search, setSearch] = useState('');

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const filtered = ALL_ENGINEERS.filter((e) =>
    e.name.toLowerCase().includes(search.trim().toLowerCase())
  );

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

        {/* Engineer list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id);
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggle(item.id)}
                style={[styles.row, isSelected && styles.rowSelected]}
              >
                <Avatar initials={item.initials} size="md" />
                <View style={styles.rowText}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.role}>{item.role}</Text>
                </View>
                {/* Selection indicator — filled navy with checkmark when selected */}
                <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Confirm button — fixed above safe-area bottom */}
        <View style={styles.footer}>
          <Button
            label="Confirm Assignment"
            onPress={() => router.back()}
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
});
