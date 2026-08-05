import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import { useAuthStore } from '../../src/store/auth.store';
import { Colors, FontFamily, FontSize, Spacing } from '../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

interface LinkRow {
  icon: string;
  label: string;
}

const COMPANY_ROWS: LinkRow[] = [
  { icon: '🏢', label: 'Company Profile' },
  { icon: '👥', label: 'Manage Employees' },
  { icon: '📋', label: 'Service Categories' },
];

const APP_INFO_ROWS: LinkRow[] = [
  { icon: 'ℹ', label: 'About AS Associates' },
  { icon: '📄', label: 'Terms & Privacy' },
  { icon: '⭐', label: 'Version 1.0.0' },
];

// ─── Row components ───────────────────────────────────────────────────────────

const NavRow: React.FC<LinkRow> = ({ icon, label }) => (
  <TouchableOpacity activeOpacity={0.7} style={styles.row}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const ToggleRow: React.FC<{ icon: string; label: string; value: boolean; onValueChange: (v: boolean) => void }> = ({
  icon,
  label,
  value,
  onValueChange,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <Text style={styles.rowLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Colors.border, true: Colors.accent }}
      thumbColor={Colors.surface}
    />
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsScreen(): React.ReactElement {
  const { logout } = useAuthStore();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Navy header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Company profile card */}
          <Card style={styles.profileCard}>
            <Avatar initials="AS" size="lg" bgColor={Colors.primary} />
            <View style={styles.flex1}>
              <Text style={styles.companyName}>AS Associates</Text>
              <Text style={styles.companySub}>Architectural & Interior Contractors</Text>
              <Text style={styles.companyMeta}>admin@asassociates.com</Text>
            </View>
          </Card>

          {/* Company management */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>COMPANY MANAGEMENT</Text>
            {COMPANY_ROWS.map((r, i) => (
              <React.Fragment key={r.label}>
                <NavRow {...r} />
                {i < COMPANY_ROWS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </Card>

          {/* Notifications */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
            <ToggleRow icon="🔔" label="Push Notifications" value={pushEnabled} onValueChange={setPushEnabled} />
            <View style={styles.divider} />
            <ToggleRow icon="✉" label="Email Alerts" value={emailEnabled} onValueChange={setEmailEnabled} />
          </Card>

          {/* App info */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>APP INFO</Text>
            {APP_INFO_ROWS.map((r, i) => (
              <React.Fragment key={r.label}>
                <NavRow {...r} />
                {i < APP_INFO_ROWS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </Card>

          <Button
            label="Logout"
            variant="outline"
            onPress={() => void logout()}
            style={styles.logoutBtn}
          />
        </ScrollView>

        <AdminBottomNav activeIndex={3} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },

  header: { backgroundColor: Colors.primary, height: 56, justifyContent: 'center', paddingHorizontal: Spacing[4] },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.surface },

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },

  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  companyName: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  companySub: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  companyMeta: { fontFamily: FontFamily.medium, fontSize: 12, color: Colors.accent, marginTop: 4 },

  linkCard: { paddingVertical: Spacing[3] },
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[2],
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: 12, gap: Spacing[3] },
  rowIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  rowLabel: { flex: 1, fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textPrimary },
  chevron: { fontSize: 20, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing[4] },

  logoutBtn: { borderColor: Colors.danger, marginTop: Spacing[2] },
});
