import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/ui/Icon';
import { useMyUploads } from '../../src/hooks/useUploads';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  withAlpha,
} from '../../src/constants/tokens';

// ─── Helpers & Types ──────────────────────────────────────────────────────────

interface GalleryItem {
  id: string;
  url: string;
  resourceType: string;
  date: string;
  sortDate: number;
}

function formatUploadDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function mapUploadsToGalleryItems(
  uploads: Array<{ id: string; url: string; resourceType: string; createdAt: string }>,
): GalleryItem[] {
  return uploads.map((upload) => ({
    id: upload.id,
    url: upload.url,
    resourceType: upload.resourceType,
    date: formatUploadDate(upload.createdAt),
    sortDate: new Date(upload.createdAt).getTime(),
  }));
}

// ─── Filter chips ─────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'photo' | 'progress' | 'request';

interface FilterChip {
  key: FilterKey;
  label: string;
}

const FILTERS: FilterChip[] = [
  { key: 'all', label: 'All' },
  { key: 'photo', label: 'Photos' },
  { key: 'progress', label: 'Progress' },
  { key: 'request', label: 'Requests' },
];

// ─── Grid tile ────────────────────────────────────────────────────────────────

const GridTile: React.FC<{ item: GalleryItem }> = ({ item }) => {
  const isVideo = item.resourceType === 'video';

  return (
    <View style={styles.tile}>
      {item.url ? (
        <View style={styles.tilePlaceholder}>
          <Image source={{ uri: item.url }} style={styles.tileImage} resizeMode="cover" />
          {isVideo && (
            <View style={styles.videoOverlay}>
              <Icon name="play" size="md" color={Colors.textOnPrimary} />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.tilePlaceholder}>
          <Icon name="photo" size="lg" color={Colors.textMuted} />
        </View>
      )}
      <Text style={styles.tileDate} numberOfLines={1}>
        {item.date}
      </Text>
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <View style={styles.empty}>
    <Icon name="camera" size="2xl" color={Colors.outlineVariant} />
    <Text style={styles.emptyText}>No files uploaded yet.</Text>
  </View>
);

// ─── Loading state ────────────────────────────────────────────────────────────

const LoadingState: React.FC = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function GalleryScreen(): React.ReactElement {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('all');

  const { data: uploads, isLoading, refetch } = useMyUploads();

  const galleryItems = useMemo(
    () => (uploads ? mapUploadsToGalleryItems(uploads) : []),
    [uploads],
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return galleryItems;
    // For now, show all items regardless of filter since we don't have type info from API
    // TODO: When API returns upload type, filter by: galleryItems.filter((g) => g.type === filter)
    return galleryItems;
  }, [galleryItems, filter]);

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
        {isLoading ? (
          <LoadingState />
        ) : (
          <FlatList<GalleryItem>
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={filtered.length > 0 ? styles.gridRow : undefined}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <GridTile item={item} />}
            ListEmptyComponent={EmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                colors={[Colors.primary]}
              />
            }
          />
        )}
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
    overflow: 'hidden',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing[1],
    textAlign: 'center',
  },

  // Loading state
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing[16],
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
