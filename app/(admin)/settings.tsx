import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import { Icon, type IconName } from '../../src/components/ui/Icon';
import { useAuthStore } from '../../src/store/auth.store';
import {
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
} from '../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

interface LinkRow {
  icon: IconName;
  label: string;
  onPress?: () => void;
}

const APP_INFO_ROWS: LinkRow[] = [
  { icon: 'info', label: 'About AS Associates' },
  { icon: 'document', label: 'Terms & Privacy' },
  { icon: 'star', label: 'Version 1.0.0' },
];

// ─── Row components ───────────────────────────────────────────────────────────

const NavRow: React.FC<LinkRow> = ({ icon, label, onPress }) => (
  <TouchableOpacity activeOpacity={0.7} style={styles.row} onPress={onPress}>
    <Icon name={icon} size="md" color={Colors.textSecondary} style={styles.rowIcon} />
    <Text style={styles.rowLabel}>{label}</Text>
    <Icon name="chevronRight" size="md" color={Colors.textMuted} />
  </TouchableOpacity>
);

const ToggleRow: React.FC<{
  icon: IconName;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}> = ({ icon, label, value, onValueChange }) => (
  <View style={styles.row}>
    <Icon name={icon} size="md" color={Colors.textSecondary} style={styles.rowIcon} />
    <Text style={styles.rowLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Colors.border, true: Colors.primary }}
      thumbColor={Colors.surface}
    />
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [pushEnabled,      setPushEnabled]      = useState(true);
  const [emailEnabled,     setEmailEnabled]      = useState(false);
  const [showCompanyEdit,  setShowCompanyEdit]   = useState(false);
  const [companyName,      setCompanyName]       = useState('AS Associates');
  const [regNumber,        setRegNumber]         = useState('CRN-2023-98471');
  const [address,          setAddress]           = useState('Unit 4, Andheri Industrial Estate, Mumbai 400053');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — navy, flat */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Admin profile card */}
          <Card style={styles.profileCard}>
            <Avatar initials="AS" size="lg" bgColor={Colors.primary} />
            <View style={styles.flex1}>
              <Text style={styles.companyName}>AS Associates</Text>
              <Text style={styles.companySub}>Architectural & Interior Contractors</Text>
              {/* Email is metadata — textMuted, not accent */}
              <Text style={styles.companyMeta}>admin@asassociates.com</Text>
            </View>
          </Card>

          {/* Company management */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>COMPANY MANAGEMENT</Text>

            {/* Company Profile — toggles inline edit panel */}
            <NavRow
              icon="client"
              label="Company Profile"
              onPress={() => setShowCompanyEdit((v) => !v)}
            />
            {showCompanyEdit && (
              <View style={styles.expandPanel}>
                <Input
                  label="Company Name"
                  value={companyName}
                  onChangeText={setCompanyName}
                  containerStyle={styles.expandField}
                />
                <Input
                  label="Registration Number"
                  value={regNumber}
                  onChangeText={setRegNumber}
                  containerStyle={styles.expandField}
                />
                <Input
                  label="Primary Address"
                  value={address}
                  onChangeText={setAddress}
                  containerStyle={styles.expandField}
                />
                <Button
                  label="Save"
                  onPress={() => {
                    console.log('Company profile saved:', { companyName, regNumber, address });
                    setShowCompanyEdit(false);
                  }}
                  style={styles.expandSaveBtn}
                />
              </View>
            )}

            <View style={styles.divider} />
            <NavRow
              icon="employees"
              label="Manage Employees"
              onPress={() => router.push('/(admin)/employees' as never)}
            />
            <View style={styles.divider} />
            <NavRow
              icon="document"
              label="Service Categories"
              onPress={() => router.push('/(admin)/settings/service-categories' as never)}
            />
            <View style={styles.divider} />
            <NavRow icon="reports" label="Reports" onPress={() => router.push('/(admin)/reports' as never)} />
          </Card>

          {/* Notifications */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
            <ToggleRow icon="requests" label="Push Notifications" value={pushEnabled}  onValueChange={setPushEnabled}  />
            <View style={styles.divider} />
            <ToggleRow icon="email"  label="Email Alerts"        value={emailEnabled} onValueChange={setEmailEnabled} />
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

          {/* Logout — outline danger variant */}
          <Button
            label="Logout"
            variant="outline"
            onPress={() => void logout()}
            style={styles.logoutBtn}
          />
        </ScrollView>

        <AdminBottomNav activeIndex={4} />
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

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },

  // Profile card — row layout with large avatar
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  // headline-sm: 18px / bold
  companyName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  // body-md: 14px / 400 — subtitle / description
  companySub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // label-sm: 12px / 500 — email metadata
  companyMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Link/toggle card — no horizontal padding on card itself; rows carry it
  linkCard: { paddingVertical: Spacing[3] },

  // Overline: xs (11px) / medium / wider letter-spacing / muted
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[2],
  },

  // List item pattern per DESIGN.md §14: 12px vertical padding
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  rowIcon: { width: 24, textAlign: 'center' },
  // List item title — body-lg: 16px / medium
  rowLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing[4] },

  // Logout button — outline with danger border color
  logoutBtn: { borderColor: Colors.danger, marginTop: Spacing[2] },

  // Company Profile inline expansion panel
  expandPanel: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
    gap: Spacing[3],
  },
  expandField: { marginBottom: 0 },
  expandSaveBtn: { marginTop: Spacing[1] },
});
