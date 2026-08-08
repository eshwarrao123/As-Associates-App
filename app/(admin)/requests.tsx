import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  withAlpha,
} from '../../src/constants/tokens';
import type { BadgeVariant } from '../../src/types';

// ─── Types & mock data ────────────────────────────────────────────────────────

type ReqStatus = 'pending' | 'approved' | 'rejected';
type ReqType = 'Material' | 'Issue' | 'Support';
type Priority = 'Low' | 'Medium' | 'High';

interface AdminRequest {
  id: string;
  type: ReqType;
  typeColor: string;
  name: string;
  project: string;
  subject: string;
  priority: Priority;
  status: ReqStatus;
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

const REQUESTS: AdminRequest[] = [
  { id: '1', type: 'Material', typeColor: TYPE_COLOR.Material, name: 'Rahul Kumar',   project: 'ICICI Bank HQ',      subject: 'Cement Bags x50',            priority: 'High',   status: 'pending'  },
  { id: '2', type: 'Issue',    typeColor: TYPE_COLOR.Issue,    name: 'Anita Sharma',  project: 'Axis Bank - Bandra', subject: 'Electrical wiring fault',    priority: 'High',   status: 'pending'  },
  { id: '3', type: 'Support',  typeColor: TYPE_COLOR.Support,  name: 'Vikram Patel',  project: 'HDFC Bank - Powai',  subject: 'Need extra manpower',        priority: 'Medium', status: 'approved' },
  { id: '4', type: 'Material', typeColor: TYPE_COLOR.Material, name: 'Priya Joshi',   project: 'Tech Park Phase 1',  subject: 'Steel rods x200',            priority: 'Medium', status: 'approved' },
  { id: '5', type: 'Issue',    typeColor: TYPE_COLOR.Issue,    name: 'Manish Rao',    project: 'Lodha Allumount',    subject: 'Water seepage in basement',  priority: 'Low',    status: 'rejected' },
  { id: '6', type: 'Support',  typeColor: TYPE_COLOR.Support,  name: 'Rahul Kumar',   project: 'ICICI Bank HQ',      subject: 'Site inspection request',    priority: 'Low',    status: 'pending'  },
];

type Filter = 'All' | 'Pending' | 'Approved' | 'Rejected';
const FILTERS: Filter[] = ['All', 'Pending', 'Approved', 'Rejected'];
const FILTER_STATUS: Record<Exclude<Filter, 'All'>, ReqStatus> = {
  Pending:  'pending',
  Approved: 'approved',
  Rejected: 'rejected',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminRequestsScreen(): React.ReactElement {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('All');

  const filtered =
    filter === 'All' ? REQUESTS : REQUESTS.filter((r) => r.status === FILTER_STATUS[filter]);

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
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <Card style={styles.reqCard}>
              {/* Type chip row + priority pill */}
              <View style={styles.topRow}>
                <View style={[styles.dot, { backgroundColor: item.typeColor }]} />
                <View style={[styles.typeChip, { backgroundColor: withAlpha(item.typeColor, 0.09) }]}>
                  <Text style={[styles.typeChipText, { color: item.typeColor }]}>{item.type}</Text>
                </View>
                <View style={styles.flex1} />
                <View style={[styles.priorityPill, { borderColor: PRIORITY_COLOR[item.priority] }]}>
                  <Text style={[styles.priorityText, { color: PRIORITY_COLOR[item.priority] }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>

              {/* Card title — body-lg (16px/bold) per card spec §8 */}
              <Text style={styles.subject}>{item.subject}</Text>
              {/* Subtitle — body-md (14px/400) */}
              <Text style={styles.meta}>{item.name} · {item.project}</Text>

              {item.status === 'pending' ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity activeOpacity={0.85} style={[styles.actionBtn, styles.approveBtn]}>
                    <Text style={styles.approveText}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.85} style={[styles.actionBtn, styles.rejectBtn]}>
                    <Text style={styles.rejectText}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.statusRow}>
                  <Badge variant={item.status} />
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
  priorityPill: {
    borderWidth: 1,
    borderRadius: BorderRadius.badge,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
  },
  // label-sm: 12px / 500
  priorityText: {
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
