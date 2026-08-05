import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/tokens';
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
  Issue: Colors.danger,
  Support: Colors.primary,
};

const PRIORITY_COLOR: Record<Priority, string> = {
  Low: Colors.success,
  Medium: Colors.warning,
  High: Colors.danger,
};

const REQUESTS: AdminRequest[] = [
  { id: '1', type: 'Material', typeColor: TYPE_COLOR.Material, name: 'Rahul Kumar', project: 'ICICI Bank HQ', subject: 'Cement Bags x50', priority: 'High', status: 'pending' },
  { id: '2', type: 'Issue', typeColor: TYPE_COLOR.Issue, name: 'Anita Sharma', project: 'Axis Bank - Bandra', subject: 'Electrical wiring fault', priority: 'High', status: 'pending' },
  { id: '3', type: 'Support', typeColor: TYPE_COLOR.Support, name: 'Vikram Patel', project: 'HDFC Bank - Powai', subject: 'Need extra manpower', priority: 'Medium', status: 'approved' },
  { id: '4', type: 'Material', typeColor: TYPE_COLOR.Material, name: 'Priya Joshi', project: 'Tech Park Phase 1', subject: 'Steel rods x200', priority: 'Medium', status: 'approved' },
  { id: '5', type: 'Issue', typeColor: TYPE_COLOR.Issue, name: 'Manish Rao', project: 'Lodha Allumount', subject: 'Water seepage in basement', priority: 'Low', status: 'rejected' },
  { id: '6', type: 'Support', typeColor: TYPE_COLOR.Support, name: 'Rahul Kumar', project: 'ICICI Bank HQ', subject: 'Site inspection request', priority: 'Low', status: 'pending' },
];

type Filter = 'All' | 'Pending' | 'Approved' | 'Rejected';
const FILTERS: Filter[] = ['All', 'Pending', 'Approved', 'Rejected'];
const FILTER_STATUS: Record<Exclude<Filter, 'All'>, ReqStatus> = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminRequestsScreen(): React.ReactElement {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered =
    filter === 'All' ? REQUESTS : REQUESTS.filter((r) => r.status === FILTER_STATUS[filter]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Navy header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Requests</Text>
        </View>

        {/* Filter tabs */}
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
              <View style={styles.topRow}>
                <View style={[styles.dot, { backgroundColor: item.typeColor }]} />
                <View style={[styles.typeChip, { backgroundColor: `${item.typeColor}18` }]}>
                  <Text style={[styles.typeChipText, { color: item.typeColor }]}>{item.type}</Text>
                </View>
                <View style={styles.flex1} />
                <View style={[styles.priorityPill, { borderColor: PRIORITY_COLOR[item.priority] }]}>
                  <Text style={[styles.priorityText, { color: PRIORITY_COLOR[item.priority] }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>

              <Text style={styles.subject}>{item.subject}</Text>
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
            </Card>
          )}
        />

        <AdminBottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },

  header: {
    backgroundColor: Colors.primary,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
  },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.surface },

  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: { borderBottomColor: Colors.accent },
  filterText: { fontFamily: FontFamily.medium, fontSize: 13, color: Colors.textSecondary },
  filterTextActive: { color: Colors.accent },

  list: { padding: Spacing[4] },
  sep: { height: Spacing[3] },

  reqCard: { gap: Spacing[2] },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  dot: { width: 8, height: 8, borderRadius: 4 },
  typeChip: { borderRadius: BorderRadius.badge, paddingHorizontal: 10, paddingVertical: 3 },
  typeChipText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs },
  priorityPill: { borderWidth: 1, borderRadius: BorderRadius.badge, paddingHorizontal: 10, paddingVertical: 3 },
  priorityText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs },

  subject: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  meta: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },

  actionRow: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[1] },
  actionBtn: { flex: 1, height: 40, borderRadius: BorderRadius.btn, alignItems: 'center', justifyContent: 'center' },
  approveBtn: { backgroundColor: Colors.success },
  approveText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.surface },
  rejectBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.danger },
  rejectText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.danger },

  statusRow: { flexDirection: 'row', marginTop: Spacing[1] },
});
