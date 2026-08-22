import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import { useAllRequests, useApproveRequest, useRejectRequest } from '../../src/hooks/useAdminRequests';
import { getErrorMessage } from '../../src/services/api/errorHandler';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  withAlpha,
} from '../../src/constants/tokens';
import type { BadgeVariant } from '../../src/types';

// ─── Types & Helpers ──────────────────────────────────────────────────────────

type Filter = 'All' | 'Pending' | 'Approved' | 'Rejected';
const FILTERS: Filter[] = ['All', 'Pending', 'Approved', 'Rejected'];

const FILTER_TO_API_STATUS: Record<Filter, string | undefined> = {
  All: undefined,
  Pending: 'PENDING',
  Approved: 'APPROVED',
  Rejected: 'REJECTED',
};

const TYPE_COLOR: Record<string, string> = {
  MATERIAL: Colors.warning,
  ISSUE: Colors.danger,
  SUPPORT: Colors.primary,
  LEAVE: Colors.primary,
  ADVANCE: Colors.warning,
  OTHER: Colors.textMuted,
};

function getTypeColor(type: string): string {
  return TYPE_COLOR[type.toUpperCase()] || Colors.textMuted;
}

function mapStatusToBadge(status: string): BadgeVariant {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'pending';
  }
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminRequestsScreen(): React.ReactElement {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('All');

  const apiStatus = FILTER_TO_API_STATUS[filter];
  const { data: requests, isLoading, refetch } = useAllRequests(apiStatus);
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const handleApprove = (id: string) => {
    approveRequest.mutate(id, {
      onError: (err) => {
        Alert.alert('Error', getErrorMessage(err));
      },
    });
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject Request', 'Reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          rejectRequest.mutate(
            { id },
            {
              onError: (err) => {
                Alert.alert('Error', getErrorMessage(err));
              },
            },
          );
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — navy, flat */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Requests</Text>
        </View>

        {/* Filter tabs — active = navy per DESIGN.md §10 */}
        <View style={styles.filterBar}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.7}
                onPress={() => setFilter(f)}
                style={[styles.filterTab, active && styles.filterTabActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          data={requests ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No requests found.</Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            const typeColor = getTypeColor(item.type);
            const userName = item.user
              ? `${item.user.firstName} ${item.user.lastName}`
              : 'Unknown';
            const badgeVariant = mapStatusToBadge(item.status);

            return (
              <Card style={styles.reqCard}>
                {/* Type chip row */}
                <View style={styles.topRow}>
                  <View style={[styles.dot, { backgroundColor: typeColor }]} />
                  <View style={[styles.typeChip, { backgroundColor: withAlpha(typeColor, 0.09) }]}>
                    <Text style={[styles.typeChipText, { color: typeColor }]}>
                      {item.type}
                    </Text>
                  </View>
                  <View style={styles.flex1} />
                </View>

                {/* Card title — body-lg (16px/bold) per card spec §8 */}
                <Text style={styles.subject}>{item.description}</Text>
                {/* Subtitle — body-md (14px/400) */}
                <Text style={styles.meta}>
                  {userName} · {formatDate(item.createdAt)}
                </Text>

                {item.status === 'PENDING' ? (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleApprove(item.id)}
                      disabled={approveRequest.isPending || rejectRequest.isPending}
                    >
                      <Text style={styles.approveText}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleReject(item.id)}
                      disabled={approveRequest.isPending || rejectRequest.isPending}
                    >
                      <Text style={styles.rejectText}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.statusRow}>
                    <Badge variant={badgeVariant} />
                  </View>
                )}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.viewDetailsRow}
                  onPress={() => router.push(`/(admin)/requests/${item.id}` as never)}
                >
                  <Text style={styles.viewDetailsText}>View Details →</Text>
                </TouchableOpacity>
              </Card>
            );
          }}
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
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing[8] },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing[8] },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Top app bar — 56px, navy, flat (no shadow per DESIGN.md §11)
  header: {
    backgroundColor: Colors.primary,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
  },
  // headline-sm: 18px / bold
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },

  // Filter tabs — active underline = navy (nav active per DESIGN.md §10)
  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: { borderBottomColor: Colors.primary },
  // label-md: 14px / 500
  filterText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  filterTextActive: { color: Colors.primary },

  // 16px outer padding, 12px between cards
  list: { padding: Spacing[4] },
  sep: { height: Spacing[3] },

  reqCard: { gap: Spacing[2] },

  // Type chip + priority pill row
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  dot: { width: 8, height: 8, borderRadius: 4 },
  typeChip: {
    borderRadius: BorderRadius.badge,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
  },
  // label-sm: 12px / 500
  typeChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },

  // Card title — body-lg: 16px / bold
  subject: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  // Subtitle — body-md: 14px / 400
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },

  // Action buttons — 48px height, label-md (14px/500) per DESIGN.md §6
  actionRow: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[1] },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: { backgroundColor: Colors.success },
  approveText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
  },
  // Outline danger variant — transparent bg, danger border + text
  rejectBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  rejectText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.danger,
  },

  statusRow: { flexDirection: 'row', marginTop: Spacing[1] },

  viewDetailsRow: { alignItems: 'flex-end', marginTop: Spacing[1] },
  viewDetailsText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.primary,
  },
});
