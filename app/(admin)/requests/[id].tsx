import React from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { Icon } from '../../../src/components/ui/Icon';
import { Button } from '../../../src/components/ui/Button';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import { useAdminRequest, useApproveRequest, useRejectRequest } from '../../../src/hooks/useAdminRequests';
import { getErrorMessage } from '../../../src/services/api/errorHandler';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
  withAlpha,
} from '../../../src/constants/tokens';
import type { BadgeVariant } from '../../../src/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

export default function RequestDetailScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: request, isLoading, error } = useAdminRequest(id ?? '');
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const handleApprove = () => {
    if (!request) return;

    approveRequest.mutate(request.id, {
      onSuccess: () => {
        Alert.alert('Success', 'Request approved', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (err) => {
        Alert.alert('Error', getErrorMessage(err));
      },
    });
  };

  const handleReject = () => {
    if (!request) return;

    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Reject Request',
        'Enter a reason (optional):',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: (reason) => {
              rejectRequest.mutate(
                { id: request.id, reason },
                {
                  onSuccess: () => {
                    Alert.alert('Success', 'Request rejected', [
                      { text: 'OK', onPress: () => router.back() },
                    ]);
                  },
                  onError: (err) => {
                    Alert.alert('Error', getErrorMessage(err));
                  },
                },
              );
            },
          },
        ],
        'plain-text',
      );
    } else {
      Alert.alert('Reject Request', 'Reject this request?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            rejectRequest.mutate(
              { id: request.id },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Request rejected', [
                    { text: 'OK', onPress: () => router.back() },
                  ]);
                },
                onError: (err) => {
                  Alert.alert('Error', getErrorMessage(err));
                },
              },
            );
          },
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
              <Icon name="back" size="lg" color={Colors.textOnPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request Details</Text>
          </View>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
          <AdminBottomNav activeIndex={2} />
        </SafeAreaView>
      </>
    );
  }

  if (error || !request) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
              <Icon name="back" size="lg" color={Colors.textOnPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request Details</Text>
          </View>
          <View style={styles.loading}>
            <Text style={styles.errorText}>Failed to load request</Text>
            <Button label="Go Back" onPress={() => router.back()} />
          </View>
          <AdminBottomNav activeIndex={2} />
        </SafeAreaView>
      </>
    );
  }

  const typeColor = getTypeColor(request.type);
  const userName = request.user
    ? `${request.user.firstName} ${request.user.lastName}`
    : 'Unknown';
  const userCode = request.user?.employeeCode || 'N/A';
  const badgeVariant = mapStatusToBadge(request.status);
  const isPending = request.status === 'PENDING';
  const isProcessing = approveRequest.isPending || rejectRequest.isPending;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Navy header */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Icon name="back" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Section 1: Request Info ──────────────────────────────────── */}
          <Card style={styles.infoCard}>
            {/* REQ-XXXX in amber */}
            <Text style={styles.reqId}>REQ-{request.id.slice(0, 8).toUpperCase()}</Text>

            {/* Type chip */}
            <View style={styles.chipsRow}>
              <View style={[styles.typeChip, { backgroundColor: withAlpha(typeColor, 0.09) }]}>
                <Text style={[styles.typeChipText, { color: typeColor }]}>{request.type}</Text>
              </View>
            </View>

            {/* Subject heading */}
            <Text style={styles.subject}>{request.description}</Text>

            {/* Meta rows */}
            <View style={styles.metaBlock}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Submitted by</Text>
                <Text style={styles.metaValue}>{userName} · {userCode}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{formatDate(request.createdAt)}</Text>
              </View>
              {request.reviewedBy && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Reviewed by</Text>
                  <Text style={styles.metaValue}>
                    {request.reviewer
                      ? `${request.reviewer.firstName} ${request.reviewer.lastName}`
                      : 'Admin'}
                  </Text>
                </View>
              )}
              {request.reviewedAt && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Reviewed at</Text>
                  <Text style={styles.metaValue}>{formatDate(request.reviewedAt)}</Text>
                </View>
              )}
            </View>
          </Card>

          {/* ── Section 2: Review Note (if exists) ──────────────────────── */}
          {request.reviewNote && (
            <Card noPadding style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>REVIEW NOTE</Text>
              <Text style={styles.description}>{request.reviewNote}</Text>
            </Card>
          )}

          {/* ── Section 3: Status + actions ─────────────────────────────── */}
          <Card noPadding style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>STATUS</Text>
            <View style={styles.statusRow}>
              <Badge variant={badgeVariant} />
            </View>

            {isPending && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={handleApprove}
                  disabled={isProcessing}
                >
                  <Text style={styles.approveText}>
                    {approveRequest.isPending ? 'Approving...' : '✓ Approve'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={handleReject}
                  disabled={isProcessing}
                >
                  <Text style={styles.rejectText}>
                    {rejectRequest.isPending ? 'Rejecting...' : '✕ Reject'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </ScrollView>

        <AdminBottomNav activeIndex={2} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing[4] },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },

  header: {
    backgroundColor: Colors.primary,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },

  infoCard: { gap: Spacing[3] },

  reqId: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.accent,
    letterSpacing: LetterSpacing.wide,
  },

  chipsRow: { flexDirection: 'row', gap: Spacing[2], flexWrap: 'wrap' },
  typeChip: {
    borderRadius: BorderRadius.badge,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
  },
  typeChipText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm },

  subject: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    lineHeight: 28,
  },

  metaBlock: { gap: Spacing[2] },
  metaRow: { flexDirection: 'row', gap: Spacing[2] },
  metaLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    width: 100,
  },
  metaValue: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  sectionCard: { paddingTop: Spacing[3], paddingBottom: Spacing[4] },
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    paddingHorizontal: Spacing[4],
  },

  statusRow: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[2] },

  actionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: { backgroundColor: Colors.success },
  approveText: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.textOnPrimary },
  rejectBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.danger },
  rejectText: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.danger },
});

