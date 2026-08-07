import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.store';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Icon } from '../../src/components/ui/Icon';
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
  const { user } = useAuthStore();
  const [marked, setMarked] = useState(false);

  const cells: (number | null)[] = [
    ...Array<null>(LEADING_BLANKS).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* ── App Bar ─────────────────────────────────────────────────────── */}
        <View style={styles.appBar}>
          <Icon name="compassOutline" size="lg" color={Colors.primary} />
          <Text style={styles.appBarTitle}>AS Associates</Text>
          <Avatar initials={user?.avatarInitials ?? 'U'} size="sm" />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Today ─────────────────────────────────────────────────────── */}
          <View style={styles.todayBlock}>
            <Text style={styles.todayLabel}>Today</Text>
            <Text style={styles.todayDate}>20 July 2026</Text>

            {marked ? (
              <View style={styles.markedRow}>
                <Icon name="check" size="md" color={Colors.success} />
                <Text style={styles.markedText}>Marked Present at 9:14 AM</Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.presentBtn}
                onPress={() => setMarked(true)}
              >
                <Icon name="checkCircle" size="md" color={Colors.textOnPrimary} />
                <Text style={styles.presentBtnText}>Mark Present</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Calendar ──────────────────────────────────────────────────── */}
          <Card style={styles.calendarCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity hitSlop={12} activeOpacity={0.7}>
                <Text style={styles.calArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calMonth}>July 2026</Text>
              <TouchableOpacity hitSlop={12} activeOpacity={0.7}>
                <Text style={styles.calArrow}>›</Text>
              </TouchableOpacity>
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
                const dot = dotStyle(status);

                return (
                  <View key={day} style={styles.dayCell}>
                    <View style={[styles.dayCircle, circleStyle(status)]}>
                      <Text style={dayTextStyle(status, weekend)}>{day}</Text>
                    </View>
                    {/* Reserve dot height on every cell so rows stay aligned */}
                    <View style={[styles.dayDot, dot]} />
                  </View>
                );
              })}
            </View>

            <View style={styles.legendDivider} />

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.dayDot, styles.dotPresent]} />
                <Text style={styles.legendLabel}>Present</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dayDot, styles.dotAbsent]} />
                <Text style={styles.legendLabel}>Absent</Text>
              </View>
            </View>
          </Card>

          {/* ── Stats ─────────────────────────────────────────────────────── */}
          <Card noPadding style={styles.statsCard}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>21</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Working Days</Text>
            </View>
          </Card>

        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Day cell style helpers ───────────────────────────────────────────────────

// Only "today" carries a filled circle in the Stitch design; present/absent are
// communicated by the dot beneath the number.
function circleStyle(status: DayStatus) {
  return status === 'today' ? styles.dayCircleToday : undefined;
}

function dotStyle(status: DayStatus) {
  switch (status) {
    case 'present': return styles.dotPresent;
    case 'absent':  return styles.dotAbsent;
    default:        return undefined;
  }
}

function dayTextStyle(status: DayStatus, weekend: boolean) {
  if (status === 'today') return styles.dayTextToday;
  if (status === 'future') return styles.dayTextFuture;
  return weekend ? styles.dayTextWeekend : styles.dayText;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL = 40;
const DOT = 6;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // App bar — light surface per Stitch screen, title left-aligned beside the mark
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appBarTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    color: Colors.primaryDark,
  },

  content: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[8],
    gap: Spacing[6],
  },

  // ── Today block ─────────────────────────────────────────────────────────────
  todayBlock: {
    alignItems: 'center',
    paddingTop: Spacing[6],
    gap: Spacing[2],
  },
  todayLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  todayDate: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    lineHeight: 38,
    color: Colors.textPrimary,
  },
  presentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginHorizontal: Spacing[8],
    marginTop: Spacing[3],
    height: 48,
    gap: Spacing[2],
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.success,
  },
  presentBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textOnPrimary,
  },
  markedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginHorizontal: Spacing[8],
    marginTop: Spacing[3],
    height: 48,
    gap: Spacing[2],
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.successSubtle,
  },
  markedText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.successText,
  },

  // ── Calendar ────────────────────────────────────────────────────────────────
  calendarCard: { gap: Spacing[4] },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calMonth: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    lineHeight: 26,
    color: Colors.textPrimary,
  },
  calArrow: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing[2],
  },

  weekRow: { flexDirection: 'row' },
  weekCell: { flex: 1, alignItems: 'center' },
  weekLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
  },
  dayCircle: {
    width: CELL,
    height: CELL,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: { backgroundColor: Colors.primary },

  dayText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  dayTextToday: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
  },
  dayTextFuture: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.disabled,
  },
  dayTextWeekend: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.disabled,
  },

  dayDot: {
    width: DOT,
    height: DOT,
    borderRadius: BorderRadius.full,
  },
  dotPresent: { backgroundColor: Colors.success },
  dotAbsent: { backgroundColor: Colors.danger },

  legendDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[6],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  legendLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  // ── Stats ───────────────────────────────────────────────────────────────────
  statsCard: {
    flexDirection: 'row',
    paddingVertical: Spacing[4],
  },
  statCell: { flex: 1, alignItems: 'center', gap: Spacing[1] },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[1],
  },
});
