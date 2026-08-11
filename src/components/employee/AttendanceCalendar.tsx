import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DayStatus = 'present' | 'absent' | 'late' | 'today' | 'weekend' | 'future' | 'empty';

export interface AttendanceDayData {
  day: number; // 1–31
  status: DayStatus;
}

interface AttendanceCalendarProps {
  year: number;
  month: number; // 0-indexed (JS Date)
  data: AttendanceDayData[];
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CIRCLE: Record<DayStatus, { bg: string | null; text: string }> = {
  present: { bg: Colors.success, text: Colors.surface },
  absent: { bg: Colors.danger, text: Colors.surface },
  late: { bg: Colors.warning, text: Colors.surface },
  today: { bg: Colors.primary, text: Colors.surface },
  weekend: { bg: null, text: Colors.border },
  future: { bg: null, text: Colors.textSecondary },
  empty: { bg: null, text: 'transparent' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  year,
  month,
  data,
}) => {
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const result: { day: number | null; status: DayStatus }[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) result.push({ day: null, status: 'empty' });

    for (let d = 1; d <= daysInMonth; d++) {
      const isSunday = (firstDay + d - 1) % 7 === 0;
      const isSaturday = (firstDay + d - 1) % 7 === 6;
      const isToday = isCurrentMonth && today.getDate() === d;
      const isFuture = isCurrentMonth && d > today.getDate();
      const found = data.find((x) => x.day === d);

      let status: DayStatus;
      if (isToday) status = 'today';
      else if (found) status = found.status;
      else if (isFuture) status = 'future';
      else if (isSunday || isSaturday) status = 'weekend';
      else status = 'future';

      result.push({ day: d, status });
    }
    return result;
  }, [year, month, data]);

  return (
    <View style={styles.container}>
      {/* Day-of-week header */}
      <View style={styles.row}>
        {DAY_LABELS.map((d) => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Day cells in rows of 7 */}
      {Array.from({ length: Math.ceil(cells.length / 7) }, (_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
            const { bg, text } = STATUS_CIRCLE[cell.status];
            return (
              <View key={colIdx} style={styles.cell}>
                {cell.day !== null && (
                  <View style={[styles.circle, bg ? { backgroundColor: bg } : null]}>
                    <Text style={[styles.dayText, { color: text }]}>
                      {cell.day}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingVertical: Spacing[1],
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  circle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
});
