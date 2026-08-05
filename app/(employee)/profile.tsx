import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { useAuthStore } from '../../src/store/auth.store';
import { Colors, FontFamily, FontSize, Spacing } from '../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Projects', value: '4', color: Colors.primary },
  { label: 'Uploads', value: '18', color: Colors.primary },
  { label: 'Attendance', value: '87%', color: Colors.success },
];

interface Row {
  icon: string;
  label: string;
}

const CONTACT_ROWS: Row[] = [
  { icon: '📞', label: '+91 98765 43210' },
  { icon: '✉', label: 'rahul@asassociates.com' },
];

const ACCOUNT_ROWS: Row[] = [
  { icon: '🔒', label: 'Change Password' },
  { icon: 'ℹ', label: 'Personal Information' },
];

// ─── Row component ────────────────────────────────────────────────────────────

const LinkRow: React.FC<Row> = ({ icon, label }) => (
  <TouchableOpacity activeOpacity={0.7} style={styles.linkRow}>
    <Text style={styles.linkIcon}>{icon}</Text>
    <Text style={styles.linkLabel}>{label}</Text>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileScreen(): React.ReactElement {
  const { logout } = useAuthStore();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Navy header */}
          <View style={styles.header}>
            <Avatar initials="RK" size="lg" style={styles.headerAvatar} />
            <Text style={styles.headerName}>Rahul Kumar</Text>
            <Text style={styles.headerId}>ASA-2024-047</Text>
            <Text style={styles.headerRole}>Site Engineer</Text>
          </View>

          {/* Stats card overlapping header */}
          <Card noPadding style={styles.statsCard}>
            {STATS.map((stat, idx) => (
              <React.Fragment key={stat.label}>
                <View style={styles.statCell}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
                {idx < STATS.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </Card>

          {/* Contact info */}
          <View style={styles.body}>
            <Card noPadding style={styles.linkCard}>
              <Text style={styles.sectionLabel}>CONTACT INFO</Text>
              {CONTACT_ROWS.map((r, i) => (
                <React.Fragment key={r.label}>
                  <LinkRow {...r} />
                  {i < CONTACT_ROWS.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card>

            {/* Account */}
            <Card noPadding style={styles.linkCard}>
              <Text style={styles.sectionLabel}>ACCOUNT</Text>
              {ACCOUNT_ROWS.map((r, i) => (
                <React.Fragment key={r.label}>
                  <LinkRow {...r} />
                  {i < ACCOUNT_ROWS.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card>

            <Button
              label="Logout"
              variant="outline"
              onPress={() => void logout()}
              style={styles.logoutBtn}
            />
          </View>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing[8] },

  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: Spacing[6],
    paddingBottom: Spacing[8],
  },
  headerAvatar: { width: 72, height: 72, borderRadius: 36 },
  headerName: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.surface, marginTop: Spacing[3] },
  headerId: { fontFamily: FontFamily.medium, fontSize: 13, color: Colors.accent, marginTop: 2 },
  headerRole: { fontFamily: FontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.80)', marginTop: 2 },

  statsCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing[4],
    marginTop: -Spacing[5],
    padding: Spacing[4],
  },
  statCell: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: FontFamily.bold, fontSize: FontSize['3xl'] },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.5,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  body: { padding: Spacing[4], gap: Spacing[3] },

  linkCard: { paddingVertical: Spacing[3] },
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[2],
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: 14, gap: Spacing[3] },
  linkIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  linkLabel: { flex: 1, fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textPrimary },
  chevron: { fontSize: 20, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing[4] },

  logoutBtn: {
    borderColor: Colors.danger,
    marginTop: Spacing[2],
  },
});
