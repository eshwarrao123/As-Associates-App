import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../../src/components/ui/Icon';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  LetterSpacing,
} from '../../../src/constants/tokens';

// ─── Static configuration ─────────────────────────────────────────────────────

// Service categories used in project creation (app/(admin)/projects/new.tsx)
// These are domain-specific enums maintained as static configuration
const SERVICE_CATEGORIES = [
  'Civil',
  'Electrical',
  'Painting',
  'HVAC',
  'Plumbing',
  'False Ceiling',
  'Furniture',
  'Signage',
  'Flooring',
  'Fire Safety',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceCategoriesScreen(): React.ReactElement {
  const router = useRouter();

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
          data={SERVICE_CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Icon name="document" size="md" color={Colors.textSecondary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>{item}</Text>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.footerNote}>
              <Icon name="info" size="sm" color={Colors.textMuted} />
              <Text style={styles.footerNoteText}>
                Service categories are managed as part of the application configuration.
                These categories are used when creating or editing projects.
              </Text>
            </View>
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
    gap: Spacing[3],
  },
  rowIcon: {
    width: 24,
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

  footerNote: {
    flexDirection: 'row',
    gap: Spacing[2],
    margin: Spacing[4],
    padding: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  footerNoteText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
