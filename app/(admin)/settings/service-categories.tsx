import React, { useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../../src/components/ui/Icon';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
} from '../../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  'Civil',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Painting',
  'Furniture',
  'Flooring',
  'False Ceiling',
  'Signage',
  'Fire Safety',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceCategoriesScreen(): React.ReactElement {
  const router = useRouter();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c, true]))
  );

  const toggle = (cat: string) =>
    setEnabled((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Navy header */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Icon name="back" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Categories</Text>
        </View>

        <FlatList
          data={DEFAULT_CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{item}</Text>
              <Switch
                value={enabled[item] ?? true}
                onValueChange={() => toggle(item)}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.surface}
              />
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addBtn}
              onPress={() => console.log('Add category pressed')}
            >
              <Text style={styles.addBtnText}>+ Add Category</Text>
            </TouchableOpacity>
          }
        />

        <AdminBottomNav activeIndex={4} />
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

  list: { paddingVertical: Spacing[2], paddingBottom: Spacing[8] },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  rowLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[4],
  },

  addBtn: {
    margin: Spacing[4],
    height: 48,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textOnAccent,
  },
});
