import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/ui/Icon';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  withAlpha,
} from '../../src/constants/tokens';

// ─── Types & mock data ────────────────────────────────────────────────────────

type UploadType = 'photo' | 'progress' | 'request';

interface GalleryItem {
  id: string;
  type: UploadType;
  date: string;           // display label
  sortDate: number;       // for ordering
  projectName: string;
}

const NOW = Date.now();
const DAY = 86_400_000;

const MOCK_GALLERY: GalleryItem[] = [
  { id: '1',  type: 'photo',    date: 'Today',       sortDate: NOW,             projectName: 'ICICI Bank HQ' },
  { id: '2',  type: 'photo',    date: 'Today',       sortDate: NOW - 3600_000,  projectName: 'ICICI Bank HQ' },
  { id: '3',  type: 'progress', date: 'Today',       sortDate: NOW - 7200_000,  projectName: 'Godrej One Retrofit' },
  { id: '4',  type: 'photo',    date: 'Yesterday',   sortDate: NOW - DAY,       projectName: 'ICICI Bank HQ' },
  { id: '5',  type: 'request',  date: 'Yesterday',   sortDate: NOW - DAY * 1.2, projectName: 'ICICI Bank HQ' },
  { id: '6',  type: 'photo',    date: '10 Aug',      sortDate: NOW - DAY * 3,   projectName: 'Godrej One Retrofit' },
  { id: '7',  type: 'progress', date: '09 Aug',      sortDate: NOW - DAY * 4,   projectName: 'ICICI Bank HQ' },
  { id: '8',  type: 'photo',    date: '07 Aug',      sortDate: NOW - DAY * 6,   projectName: 'Godrej One Retrofit' },
  { id: '9',  type: 'request',  date: '05 Aug',      sortDate: NOW - DAY * 8,   projectName: 'ICICI Bank HQ' },
  { id: '10', type: 'photo',    date: '03 Aug',      sortDate: NOW - DAY * 10,  projectName: 'Godrej One Retrofit' },
  { id: '11', type: 'progress', date: '01 Aug',      sortDate: NOW - DAY * 12,  projectName: 'ICICI Bank HQ' },
  { id: '12', type: 'photo',    date: '30 Jul',      sortDate: NOW - DAY * 14,  projectName: 'Godrej One Retrofit' },
];

// ─── Filter chips ─────────────────────────────────────────────────────────────

type FilterKey = 'all' | UploadType;

interface FilterChip {
  key: FilterKey;
  label: string;
}

const FILTERS: FilterChip[] = [
  { key: 'all',      label: 'All' },
  { key: 'photo',    label: 'Photos' },
  { key: 'progress', label: 'Progress' },
  { key: 'request',  label: 'Requests' },
];

// ─── Grid tile ────────────────────────────────────────────────────────────────

const GridTile: React.FC<{ item: GalleryItem }> = ({ item }) => (
  <View style={styles.tile}>
    <View style={styles.tilePlaceholder}>
      <Icon name="photo" size="lg" color={Colors.textMuted} />
    </View>
    <Text style={styles.tileDate} numberOfLines={1}>{item.date}</Text>
  </View>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <View style={styles.empty}>
    <Icon name="camera" size="2xl" color={Colors.outlineVariant} />
    <Text style={styles.emptyText}>No uploads yet</Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function GalleryScreen(): React.ReactElement {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? MOCK_GALLERY : MOCK_GALLERY.filter((g) => g.type === filter)),
    [filter],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Header ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Icon name="back" size="lg" color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Uploads</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Filter chips ─────────────────────────────────────────────── */}
        <View style={styles.filterBar}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.7}
                onPress={() => setFilter(f.key)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipLabel, active && styles.filterChipLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Grid ─────────────────────────────────────────────────────── */}
        <FlatList<GalleryItem>
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <GridTile item={item} />}
          ListEmptyComponent={EmptyState}
        />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.background,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },

  // Filter chips
  filterBar: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[4],
  },
  filterChip: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.badge,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  filterChipLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: 18,
    letterSpacing: 0.14,
    color: Colors.textSecondary,
  },
  filterChipLabelActive: {
    color: Colors.textOnPrimary,
  },

  // Grid
  gridContent: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
  },
  gridRow: {
    gap: Spacing[2],
    marginBottom: Spacing[2],
  },

  // Tile
  tile: {
    flex: 1,
    maxWidth: '33%',
  },
  tilePlaceholder: {
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: withAlpha(Colors.primary, 0.06),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing[1],
    textAlign: 'center',
  },

  // Empty state
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing[16],
    gap: Spacing[3],
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
