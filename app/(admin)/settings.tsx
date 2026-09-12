import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { AdminBottomNav } from '../../src/components/ui/AdminBottomNav';
import { Icon, type IconName } from '../../src/components/ui/Icon';
import { useAuthStore } from '../../src/store/auth.store';
import { useMe, useUpdateMe } from '../../src/hooks/useMe';
import { useCompanySettings, useUpdateCompanySettings } from '../../src/hooks/useCompanySettings';
import { getErrorMessage, parseApiError } from '../../src/services/api/errorHandler';
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


// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const [showCompanyEdit, setShowCompanyEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Editable company fields
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editRegNumber, setEditRegNumber] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Editable admin profile fields
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');

  const { data: meData, isLoading: meLoading } = useMe();
  const { data: companySettings, isLoading: isLoadingCompany } = useCompanySettings();
  const updateCompanySettings = useUpdateCompanySettings();
  const updateMe = useUpdateMe();
  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  // Use API data if available, fallback to store user
  const apiUser = meData;
  const displayFirstName = apiUser?.firstName ?? '';
  const displayLastName = apiUser?.lastName ?? '';
  const displayName = apiUser
    ? `${apiUser.firstName} ${apiUser.lastName}`
    : storeUser?.name ?? 'Admin';
  const displayEmployeeCode = apiUser?.employeeCode ?? 'N/A';
  const displayDesignation = apiUser?.designation ?? 'Administrator';
  const displayEmail = apiUser?.email ?? 'admin@asassociates.com';

  // Generate initials
  const initials = displayFirstName && displayLastName
    ? `${displayFirstName[0]}${displayLastName[0]}`.toUpperCase()
    : displayName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

  // Show loading indicator only when both meLoading and no storeUser (rare case)
  const showLoadingIndicator = meLoading && !storeUser;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await useAuthStore.getState().logoutAction();
            router.replace('/(auth)/login');
          } catch {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    router.push('/(auth)/change-password?mode=normal');
  };

  const handleEditProfile = () => {
    if (!apiUser) return;

    setEditFirstName(apiUser.firstName);
    setEditLastName(apiUser.lastName);
    setEditEmail(apiUser.email);
    setOriginalEmail(apiUser.email);
    setEditCurrentPassword('');
    setIsEditingProfile(true);
    setShowProfileEdit(true);
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setEditFirstName('');
    setEditLastName('');
    setEditEmail('');
    setEditCurrentPassword('');
    setOriginalEmail('');
  };

  const handleSaveProfile = () => {
    // Validation
    if (!editFirstName.trim()) {
      Alert.alert('Error', 'First name cannot be empty');
      return;
    }
    if (!editLastName.trim()) {
      Alert.alert('Error', 'Last name cannot be empty');
      return;
    }
    if (!editEmail.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    const emailChanged = editEmail.trim().toLowerCase() !== originalEmail.toLowerCase();

    if (emailChanged && !editCurrentPassword.trim()) {
      Alert.alert('Error', 'Current password is required to change email');
      return;
    }

    const payload: {
      firstName?: string;
      lastName?: string;
      email?: string;
      currentPassword?: string;
    } = {};

    // Only send fields that are actually being edited
    if (editFirstName.trim() !== apiUser?.firstName) {
      payload.firstName = editFirstName.trim();
    }
    if (editLastName.trim() !== apiUser?.lastName) {
      payload.lastName = editLastName.trim();
    }
    if (emailChanged) {
      payload.email = editEmail.trim();
      payload.currentPassword = editCurrentPassword.trim();
    }

    updateMe.mutate(payload, {
      onSuccess: (updatedUser) => {
        // Update auth store with new user data
        if (storeUser) {
          setUser({
            ...storeUser,
            name: `${updatedUser.firstName} ${updatedUser.lastName}`,
            email: updatedUser.email,
          });
        }

        Alert.alert('Success', 'Profile updated successfully');
        setIsEditingProfile(false);
        setEditCurrentPassword('');
      },
      onError: (error) => {
        // For profile updates, use the backend's actual error message
        // (e.g., "Current password is incorrect" for 401)
        // instead of the generic "Session expired" message
        const apiError = parseApiError(error);
        const message = apiError.statusCode === 401 || apiError.statusCode === 409 || apiError.statusCode === 422
          ? apiError.message
          : getErrorMessage(error);
        Alert.alert('Error', message);
      },
    });
  };

  const handleEditCompanyProfile = () => {
    if (!companySettings) return;

    setEditCompanyName(companySettings.companyName);
    setEditRegNumber(companySettings.registrationNumber);
    setEditAddress(companySettings.primaryAddress);
    setIsEditing(true);
    setShowCompanyEdit(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditCompanyName('');
    setEditRegNumber('');
    setEditAddress('');
  };

  const handleSaveCompanyProfile = () => {
    // Validation
    if (!editCompanyName.trim()) {
      Alert.alert('Error', 'Company name cannot be empty');
      return;
    }
    if (!editRegNumber.trim()) {
      Alert.alert('Error', 'Registration number cannot be empty');
      return;
    }
    if (!editAddress.trim()) {
      Alert.alert('Error', 'Primary address cannot be empty');
      return;
    }

    updateCompanySettings.mutate(
      {
        companyName: editCompanyName.trim(),
        registrationNumber: editRegNumber.trim(),
        primaryAddress: editAddress.trim(),
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Company profile updated successfully');
          setIsEditing(false);
        },
        onError: (error) => {
          Alert.alert('Error', getErrorMessage(error));
        },
      },
    );
  };

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
            <Avatar initials={initials} size="lg" bgColor={Colors.primary} photoUrl={apiUser?.photoUrl ?? null} />
            <View style={styles.flex1}>
              <View style={styles.nameRow}>
                <Text style={styles.companyName}>{displayName}</Text>
                {showLoadingIndicator && (
                  <ActivityIndicator size="small" color={Colors.primary} style={styles.nameLoader} />
                )}
              </View>
              <Text style={styles.companySub}>{displayDesignation}</Text>
              {/* Email is metadata — textMuted, not accent */}
              <Text style={styles.companyMeta}>{displayEmail}</Text>
              {displayEmployeeCode !== 'N/A' && (
                <Text style={styles.companyMeta}>ID: {displayEmployeeCode}</Text>
              )}
            </View>
          </Card>

          {/* Admin Profile Edit Section */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>ADMIN PROFILE</Text>
            <NavRow
              icon="profile"
              label="Edit Profile"
              onPress={() => {
                if (!isEditingProfile) {
                  setShowProfileEdit((v) => !v);
                }
              }}
            />
            {showProfileEdit && (
              <View style={styles.expandPanel}>
                {meLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                  </View>
                ) : isEditingProfile ? (
                  <>
                    <Input
                      label="First Name"
                      placeholder="e.g. John"
                      value={editFirstName}
                      onChangeText={setEditFirstName}
                      editable={!updateMe.isPending}
                      autoCapitalize="words"
                    />
                    <Input
                      label="Last Name"
                      placeholder="e.g. Doe"
                      value={editLastName}
                      onChangeText={setEditLastName}
                      editable={!updateMe.isPending}
                      autoCapitalize="words"
                    />
                    <Input
                      label="Email"
                      placeholder="e.g. admin@asassociates.com"
                      value={editEmail}
                      onChangeText={setEditEmail}
                      editable={!updateMe.isPending}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {editEmail.trim().toLowerCase() !== originalEmail.toLowerCase() && (
                      <>
                        <View style={styles.passwordNote}>
                          <Icon name="lock" size="sm" color={Colors.warning} />
                          <Text style={styles.passwordNoteText}>
                            Current password is required to change email
                          </Text>
                        </View>
                        <Input
                          label="Current Password"
                          placeholder="Enter your current password"
                          value={editCurrentPassword}
                          onChangeText={setEditCurrentPassword}
                          editable={!updateMe.isPending}
                          secureTextEntry
                          secureToggle
                        />
                      </>
                    )}
                    <View style={styles.editActions}>
                      <Button
                        label={updateMe.isPending ? 'Saving...' : 'Save'}
                        onPress={handleSaveProfile}
                        disabled={updateMe.isPending}
                        style={styles.flex1}
                      />
                      <Button
                        label="Cancel"
                        variant="outline"
                        onPress={handleCancelProfileEdit}
                        disabled={updateMe.isPending}
                        style={styles.flex1}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>First Name</Text>
                      <Text style={styles.readOnlyValue}>{apiUser?.firstName ?? 'Loading...'}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Last Name</Text>
                      <Text style={styles.readOnlyValue}>{apiUser?.lastName ?? 'Loading...'}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Email</Text>
                      <Text style={styles.readOnlyValue}>{apiUser?.email ?? 'Loading...'}</Text>
                    </View>
                    <Button
                      label="Edit Profile"
                      variant="outline"
                      onPress={handleEditProfile}
                      disabled={!apiUser}
                    />
                  </>
                )}
              </View>
            )}
          </Card>

          {/* Company management */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>COMPANY MANAGEMENT</Text>

            {/* Company Profile — editable */}
            <NavRow
              icon="client"
              label="Company Profile"
              onPress={() => {
                if (!isEditing) {
                  setShowCompanyEdit((v) => !v);
                }
              }}
            />
            {showCompanyEdit && (
              <View style={styles.expandPanel}>
                {isLoadingCompany ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading company profile...</Text>
                  </View>
                ) : isEditing ? (
                  <>
                    <Input
                      label="Company Name"
                      placeholder="e.g. AS Associates"
                      value={editCompanyName}
                      onChangeText={setEditCompanyName}
                      editable={!updateCompanySettings.isPending}
                    />
                    <Input
                      label="Registration Number"
                      placeholder="e.g. CRN-2023-98471"
                      value={editRegNumber}
                      onChangeText={setEditRegNumber}
                      editable={!updateCompanySettings.isPending}
                    />
                    <View>
                      <Text style={styles.fieldLabel}>Primary Address</Text>
                      <TextInput
                        style={styles.textArea}
                        value={editAddress}
                        onChangeText={setEditAddress}
                        placeholder="Full company address"
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        textAlignVertical="top"
                        editable={!updateCompanySettings.isPending}
                      />
                    </View>
                    <View style={styles.editActions}>
                      <Button
                        label={updateCompanySettings.isPending ? 'Saving...' : 'Save'}
                        onPress={handleSaveCompanyProfile}
                        disabled={updateCompanySettings.isPending}
                        style={styles.flex1}
                      />
                      <Button
                        label="Cancel"
                        variant="outline"
                        onPress={handleCancelEdit}
                        disabled={updateCompanySettings.isPending}
                        style={styles.flex1}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Company Name</Text>
                      <Text style={styles.readOnlyValue}>{companySettings?.companyName ?? 'Loading...'}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Registration Number</Text>
                      <Text style={styles.readOnlyValue}>{companySettings?.registrationNumber ?? 'Loading...'}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Primary Address</Text>
                      <Text style={styles.readOnlyValue}>{companySettings?.primaryAddress ?? 'Loading...'}</Text>
                    </View>
                    <Button
                      label="Edit Company Profile"
                      variant="outline"
                      onPress={handleEditCompanyProfile}
                      disabled={!companySettings}
                    />
                  </>
                )}
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
            <View style={styles.divider} />
            <NavRow icon="lock" label="Change Password" onPress={handleChangePassword} />
          </Card>

          {/* Notifications */}
          <Card noPadding style={styles.linkCard}>
            <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
            <View style={styles.row}>
              <Icon name="requests" size="md" color={Colors.textSecondary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Push Notifications</Text>
              <Text style={styles.unavailableText}>Not configured</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Icon name="email" size="md" color={Colors.textSecondary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Email Alerts</Text>
              <Text style={styles.unavailableText}>Not configured</Text>
            </View>
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
            label={isLoggingOut ? 'Logging out...' : 'Logout'}
            variant="outline"
            onPress={handleLogout}
            disabled={isLoggingOut}
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  nameLoader: { marginLeft: Spacing[1] },
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
  },
  loadingText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  readOnlyField: {
    gap: Spacing[1],
  },
  readOnlyLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.wider,
  },
  readOnlyValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 14,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  readOnlyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingTop: Spacing[2],
  },
  readOnlyNoteText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  unavailableText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  passwordNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: '#FFF9E6',
    padding: Spacing[2],
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE5B4',
  },
  passwordNoteText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#8B6914',
    lineHeight: 18,
  },
});
