import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { Icon } from '../../../src/components/ui/Icon';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
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

// ─── Types ────────────────────────────────────────────────────────────────────

type ReqStatus = 'pending' | 'approved' | 'rejected';
type ReqType   = 'Material' | 'Issue' | 'Support';
type Priority  = 'Low' | 'Medium' | 'High';

interface RequestDetail {
  id: string;
  reqId: string;
  type: ReqType;
  typeColor: string;
  name: string;
  role: string;
  project: string;
  subject: string;
  priority: Priority;
  status: ReqStatus;
  date: string;
  description: string;
}

const TYPE_COLOR: Record<ReqType, string> = {
  Material: Colors.warning,
  Issue:    Colors.danger,
  Support:  Colors.primary,
};

const PRIORITY_COLOR: Record<Priority, string> = {
  Low:    Colors.success,
  Medium: Colors.warning,
  High:   Colors.danger,
};

const REQUESTS: RequestDetail[] = [
  {
    id: '1', reqId: 'REQ-0001',
    type: 'Material', typeColor: TYPE_COLOR.Material,
    name: 'Rahul Kumar', role: 'Site Engineer',
    project: 'ICICI Bank HQ', subject: 'Cement Bags x50',
    priority: 'High', status: 'pending',
    date: '02 Aug 2026',
    description: 'Requesting 50 bags of OPC 53 grade cement for Phase 2 slab work. Current stock is insufficient and work is scheduled to begin on 05 Aug. Immediate procurement required to avoid site delays.',
  },
  {
    id: '2', reqId: 'REQ-0002',
    type: 'Issue', typeColor: TYPE_COLOR.Issue,
    name: 'Anita Sharma', role: 'Civil Engineer',
    project: 'Axis Bank - Bandra', subject: 'Electrical wiring fault',
    priority: 'High', status: 'pending',
    date: '02 Aug 2026',
    description: 'A short circuit was detected in the second-floor electrical conduit during routine inspection. The affected section spans approximately 12 metres and poses a safety risk. Work in that zone has been halted pending repair.',
  },
  {
    id: '3', reqId: 'REQ-0003',
    type: 'Support', typeColor: TYPE_COLOR.Support,
    name: 'Vikram Patel', role: 'Electrical Engineer',
    project: 'HDFC Bank - Powai', subject: 'Need extra manpower',
    priority: 'Medium', status: 'approved',
    date: '01 Aug 2026',
    description: 'The project timeline has been compressed by one week per client request. We require 3 additional skilled labourers for the next 10 days to meet the revised schedule without compromising quality.',
  },
  {
    id: '4', reqId: 'REQ-0004',
    type: 'Material', typeColor: TYPE_COLOR.Material,
    name: 'Priya Joshi', role: 'Project Lead',
    project: 'Tech Park Phase 1', subject: 'Steel rods x200',
    priority: 'Medium', status: 'approved',
    date: '31 Jul 2026',
    description: 'Requesting 200 units of Fe-500 TMT steel rods (12mm diameter) for column reinforcement at grid lines C4–C8. Structural drawings approved by consultant. Vendor quotation attached for reference.',
  },
  {
    id: '5', reqId: 'REQ-0005',
    type: 'Issue', typeColor: TYPE_COLOR.Issue,
    name: 'Manish Rao', role: 'Junior Engineer',
    project: 'Lodha Allumount', subject: 'Water seepage in basement',
    priority: 'Low', status: 'rejected',
    date: '30 Jul 2026',
    description: 'Minor water seepage observed along the north wall of the basement. The issue is isolated to a 2-metre section and appears to be linked to an existing crack in the waterproofing membrane. Monitoring ongoing.',
  },
  {
    id: '6', reqId: 'REQ-0006',
    type: 'Support', typeColor: TYPE_COLOR.Support,
    name: 'Rahul Kumar', role: 'Site Engineer',
    project: 'ICICI Bank HQ', subject: 'Site inspection request',
    priority: 'Low', status: 'pending',
    date: '29 Jul 2026',
    description: 'Requesting a formal site inspection by the admin team before the next client review on 10 Aug. The purpose is to document current progress and identify any open snag items that need resolution prior to the client walkthrough.',
  },
];

const STATUS_BADGE_VARIANT: Record<ReqStatus, BadgeVariant> = {
  pending:  'pending',
  approved: 'approved',
  rejected: 'rejected',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RequestDetailScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const req = REQUESTS.find((r) => r.id === id) ?? REQUESTS[0];

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
            <Text style={styles.reqId}>{req.reqId}</Text>

            {/* Type chip + priority pill */}
            <View style={styles.chipsRow}>
              <View style={[styles.typeChip, { backgroundColor: withAlpha(req.typeColor, 0.09) }]}>
                <Text style={[styles.typeChipText, { color: req.typeColor }]}>{req.type}</Text>
              </View>
              <View style={[styles.priorityPill, { borderColor: PRIORITY_COLOR[req.priority] }]}>
                <Text style={[styles.priorityText, { color: PRIORITY_COLOR[req.priority] }]}>
                  {req.priority} Priority
                </Text>
              </View>
            </View>

            {/* Subject heading */}
            <Text style={styles.subject}>{req.subject}</Text>

            {/* Meta rows */}
            <View style={styles.metaBlock}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Submitted by</Text>
                <Text style={styles.metaValue}>{req.name} · {req.role}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Project</Text>
                <Text style={styles.metaValue}>{req.project}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{req.date}</Text>
              </View>
            </View>
          </Card>

          {/* ── Section 2: Description ───────────────────────────────────── */}
          <Card noPadding style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>DESCRIPTION</Text>
            <Text style={styles.description}>{req.description}</Text>
          </Card>

          {/* ── Section 3: Status + actions ─────────────────────────────── */}
          <Card noPadding style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>STATUS</Text>
            <View style={styles.statusRow}>
              <Badge variant={STATUS_BADGE_VARIANT[req.status]} label={req.status.charAt(0).toUpperCase() + req.status.slice(1)} />
            </View>

            {req.status === 'pending' && (
              <View style={styles.actionRow}>
                <TouchableOpacity activeOpacity={0.85} style={[styles.actionBtn, styles.approveBtn]}>
                  <Text style={styles.approveText}>✓ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.85} style={[styles.actionBtn, styles.rejectBtn]}>
                  <Text style={styles.rejectText}>✕ Reject</Text>
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
  priorityPill: {
    borderWidth: 1,
    borderRadius: BorderRadius.badge,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
  },
  priorityText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm },

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

