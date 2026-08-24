import React, { useState, useMemo } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.store';
import { useAttendanceCalendar, useCheckIn } from '../../src/hooks/useAttendance';
import { useMyProjects } from '../../src/hooks/useMyProjects';
import { getErrorMessage } from '../../src/services/api/errorHandler';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Icon } from '../../src/components/ui/Icon';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/tokens';

// ─── Calendar model ───────────────────────────────────────────────────────────

type DayStatus = 'present' | 'absent' | 'late' | 'halfday' | 'leave' | 'today' | 'future' | 'none';

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Maps API attendance status to UI day status.
 */
function mapApiStatusToDayStatus(apiStatus: string): DayStatus {
  switch (apiStatus) {
    case 'PRESENT':
      return 'present';
    case 'ABSENT':
      return 'absent';
    case 'LATE':
      return 'late';
    case 'HALF_DAY':
      return 'halfday';
    case 'LEAVE':
      return 'leave';
    default:
      return 'none';
  }
}

/**
 * Formats ISO time string to display time (e.g., "9:14 AM").
 */
function formatTime(isoTime?: string): string {
  if (!isoTime) return '';
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

// column index 0 = Sunday, 6 = Saturday
function isWeekend(cellIndex: number): boolean {
  const col = cellIndex % 7;
  return col === 0 || col === 6;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AttendanceScreen(): React.ReactElement {
  const { user } = useAuthStore();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const { data: attendanceData, isLoading } = useAttendanceCalendar(currentMonth, currentYear);
  const { data: projects } = useMyProjects();
  const checkInMutation = useCheckIn();

  // Build attendance map by date
  const attendanceMap = useMemo(() => {
    const map = new Map<string, { status: DayStatus; checkInTime?: string }>();
    if (attendanceData?.data) {
      attendanceData.data.forEach((record) => {
        const day = new Date(record.date).getDate();
        map.set(String(day), {
          status: mapApiStatusToDayStatus(record.status),
          checkInTime: record.checkInTime,
        });
      });
    }
    return map;
  }, [attendanceData]);

  // Today's info
  const today = now.getDate();
  const todayStatus = attendanceMap.get(String(today));
  const isMarked = todayStatus && todayStatus.status !== 'none';

  // Calculate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleCheckIn = () => {
    // Use the first project as default - in a real app, user might select project
    const defaultProjectId = projects?.[0]?.id;

    if (!defaultProjectId) {
      Alert.alert('Error', 'No projects assigned. Please contact your admin.');
      return;
    }

    checkInMutation.mutate(defaultProjectId, {
      onError: (error) => {
        const message = getErrorMessage(error);
        Alert.alert('Error', message);
      },
    });
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  function statusForDay(day: number): DayStatus {
    // Check if it's today
    if (
      day === today &&
      currentMonth === now.getMonth() + 1 &&
      currentYear === now.getFullYear()
    ) {
      return 'today';
    }

    // Check if it's a future date
    const cellDate = new Date(currentYear, currentMonth - 1, day);
    if (cellDate > now) {
      return 'future';
    }

    // Get status from API data
    const record = attendanceMap.get(String(day));
    return record?.status ?? 'none';
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* ── App Bar ─────────────────────────────────────────────────────── */}
        <View style={styles.appBar}>
          <Image
            source={require('../../assets/logo-icon.png')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              overflow: 'hidden',
            }}
            resizeMode="contain"
          />
          <Avatar initials={user?.avatarInitials ?? 'U'} size="sm" />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Today ─────────────────────────────────────────────────────── */}
          <View style={styles.todayBlock}>
            <Text style={styles.todayLabel}>Today</Text>
            <Text style={styles.todayDate}>
              {today} {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
            </Text>

            {isMarked && todayStatus ? (
              <View style={styles.markedRow}>
                <Icon name="check" size="md" color={Colors.success} />
                <Text style={styles.markedText}>
                  Marked Present at {formatTime(todayStatus.checkInTime)}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.presentBtn}
                onPress={handleCheckIn}
                disabled={checkInMutation.isPending}
              >
                {checkInMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.textOnPrimary} />
                ) : (
                  <>
                    <Icon name="checkCircle" size="md" color={Colors.textOnPrimary} />
                    <Text style={styles.presentBtnText}>Mark Present</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* ── Calendar ──────────────────────────────────────────────────── */}
          <Card style={styles.calendarCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity hitSlop={12} activeOpacity={0.7} onPress={handlePrevMonth}>
                <Text style={styles.calArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calMonth}>
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </Text>
              <TouchableOpacity hitSlop={12} activeOpacity={0.7} onPress={handleNextMonth}>
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

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : (
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
            )}

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
              <Text style={styles.statValue}>
                {attendanceData?.summary?.present ?? 0}
              </Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>
                {attendanceData?.summary?.absent ?? 0}
              </Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>
                {attendanceData?.summary?.totalWorkingDays ?? 0}
              </Text>
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
    case 'present':
    case 'late':
      return styles.dotPresent;
    case 'absent':
      return styles.dotAbsent;
    case 'halfday':
      return styles.dotHalfDay;
    case 'leave':
      return styles.dotLeave;
    default:
      return undefined;
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
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  dotHalfDay: { backgroundColor: Colors.warning },
  dotLeave: { backgroundColor: Colors.textMuted },

  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
