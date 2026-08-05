import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/tokens';

// ─── Calendar model — July 2026 ───────────────────────────────────────────────
// July 1 2026 is a Wednesday → leading blank cells = 3 (Sun..Tue)

type DayStatus = 'present' | 'absent' | 'today' | 'future' | 'none';

const LEADING_BLANKS = 3;
const DAYS_IN_MONTH = 31;
const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function statusForDay(day: number): DayStatus {
  if (day === 20) return 'today';
  if (day === 6 || day === 13) return 'absent';
  if (day >= 1 && day <= 18) return 'present';
  if (day >= 21) return 'future';
  return 'none';
}

// column index 0 = Sunday, 6 = Saturday
function isWeekend(cellIndex: number): boolean {
  const col = cellIndex % 7;
  return col === 0 || col === 6;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AttendanceScreen(): React.ReactElement {
  const [marked, setMarked] = useState(false);

  const cells: (number | null)[] = [
    ...Array<null>(LEADING_BLANKS).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Attendance' }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Today card */}
          <Card style={styles.todayCard}>
            <Text style={styles.todayLabel}>Today</Text>
            <Text style={styles.todayDate}>20 July 2026</Text>
            {marked ? (
              <View style={styles.markedRow}>
                <Text style={styles.markedText}>✓ Marked Present at 9:14 AM</Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.presentBtn}
                onPress={() => setMarked(true)}
              >
                <Text style={styles.presentBtnText}>✓ Mark Present</Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Stats row */}
          <Card noPadding style={styles.statsCard}>
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { color: Colors.success }]}>21</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { color: Colors.danger }]}>3</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { color: Colors.textPrimary }]}>24</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </Card>

          {/* Calendar */}
          <Card style={styles.calendarCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity hitSlop={12}><Text style={styles.calArrow}>‹</Text></TouchableOpacity>
              <Text style={styles.calMonth}>July 2026</Text>
              <TouchableOpacity hitSlop={12}><Text style={styles.calArrow}>›</Text></TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_HEADERS.map((d, i) => (
                <View key={i} style={styles.weekCell}>
                  <Text style={styles.weekLabel}>{d}</Text>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, index) => {
                if (day === null) {
                  return <View key={`b${index}`} style={styles.dayCell} />;
                }
                const status = statusForDay(day);
                const weekend = isWeekend(index);
                return (
                  <View key={day} style={styles.dayCell}>
                    <View style={[styles.dayCircle, circleStyle(status)]}>
                      <Text style={dayTextStyle(status, weekend)}>{day}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>

        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Day cell style helpers ───────────────────────────────────────────────────

function circleStyle(status: DayStatus) {
  switch (status) {
    case 'present': return { backgroundColor: Colors.success };
    case 'absent':  return { backgroundColor: Colors.danger };
    case 'today':   return { backgroundColor: Colors.primary };
    default:        return undefined;
  }
}

function dayTextStyle(status: DayStatus, weekend: boolean) {
  const filled = status === 'present' || status === 'absent' || status === 'today';
  if (filled) return styles.dayTextFilled;
  if (status === 'future') return styles.dayTextFuture;
  return weekend ? styles.dayTextWeekend : styles.dayText;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL = 36;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },

  // Today card
  todayCard: { gap: Spacing[3] },
  todayLabel: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },
  todayDate: { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary },
  presentBtn: {
    height: 48,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presentBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.surface },
  markedRow: {
    height: 48,
    borderRadius: BorderRadius.btn,
    backgroundColor: `${Colors.success}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markedText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.success },

  // Stats
  statsCard: { flexDirection: 'row', padding: Spacing[4] },
  statCell: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: FontFamily.bold, fontSize: FontSize['3xl'] },
  statLabel: { fontFamily: FontFamily.regular, fontSize: 11, color: Colors.textSecondary },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  // Calendar
  calendarCard: { gap: Spacing[3] },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calMonth: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  calArrow: { fontFamily: FontFamily.bold, fontSize: 22, color: Colors.primary, paddingHorizontal: 8 },
  weekRow: { flexDirection: 'row' },
  weekCell: { flex: 1, alignItems: 'center' },
  weekLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: Colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    height: CELL + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: CELL,
    height: CELL,
    borderRadius: CELL / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textPrimary },
  dayTextFilled: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.surface },
  dayTextFuture: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#9CA3AF' },
  dayTextWeekend: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: '#9CA3AF' },
});
