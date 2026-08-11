import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../ui/Card';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/tokens';
import type { AttendanceSummary } from '../../types/employee';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceSummaryCardProps {
  summary: AttendanceSummary;
}

// ─── Sub-component: single stat cell ─────────────────────────────────────────

interface StatCellProps {
  value: number;
  label: string;
  valueColor?: string;
}

const StatCell: React.FC<StatCellProps> = ({
  value,
  label,
  valueColor = Colors.textPrimary,
}) => (
  <View style={styles.cell}>
    <Text style={[styles.cellValue, { color: valueColor }]}>{value}</Text>
    <Text style={styles.cellLabel}>{label}</Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({
  summary,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>This Month's Attendance</Text>
      <View style={styles.statsRow}>
        <StatCell
          value={summary.present}
          label="Present"
          valueColor={Colors.success}
        />
        <View style={styles.divider} />
        <StatCell
          value={summary.absent}
          label="Absent"
          valueColor={Colors.danger}
        />
        <View style={styles.divider} />
        <StatCell
          value={summary.late}
          label="Late"
          valueColor={Colors.warning}
        />
        <View style={styles.divider} />
        <StatCell
          value={summary.totalWorkingDays}
          label="Working Days"
          valueColor={Colors.primary}
        />
      </View>
    </Card>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    gap: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  cellValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    lineHeight: 28,
  },
  cellLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
});
