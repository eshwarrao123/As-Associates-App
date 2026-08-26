import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Icon, type IconName } from '../../src/components/ui/Icon';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { useAuthStore } from '../../src/store/auth.store';
import { useMe } from '../../src/hooks/useMe';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, withAlpha } from '../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Projects', value: '4', color: Colors.primary },
  { label: 'Uploads', value: '18', color: Colors.primary },
  { label: 'Attendance', value: '87%', color: Colors.success },
];

interface Row {
  icon: IconName;
  label: string;
}

const CONTACT_ROWS: Row[] = [
  { icon: 'phone', label: 'Phone' },
  { icon: 'email', label: 'Email' },
];

const ACCOUNT_ROWS: Row[] = [
  { icon: 'lock', label: 'Change Password' },
  { icon: 'info', label: 'Status' },
];

// ─── Row component ────────────────────────────────────────────────────────────

const LinkRow: React.FC<Row & { value?: string; onPress?: () => void }> = ({
  icon,
  label,
  value,
  onPress,
}) => (
  <TouchableOpacity activeOpacity={0.7} style={styles.linkRow} onPress={onPress} disabled={!onPress}>
    <Icon name={icon} size="md" color={Colors.textSecondary} style={styles.linkIcon} />
    <View style={styles.linkContent}>
      <Text style={styles.linkLabel}>{label}</Text>
      {value && <Text style={styles.linkValue}>{value}</Text>}
    </View>
    {onPress && <Icon name="chevronRight" size="md" color={Colors.textSecondary} />}
  </TouchableOpacity>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileScreen(): React.ReactElement {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: meData, isLoading: meLoading } = useMe();
  const storeUser = useAuthStore((state) => state.user);

  // ALWAYS prioritize meData (fresh API data) over storeUser (cached data)
  const displayUser = meData ?? storeUser;
  const displayFirstName = meData?.firstName ?? '';
  const displayLastName = meData?.lastName ?? '';
  const displayName = meData
    ? `${meData.firstName} ${meData.lastName}`
    : storeUser?.name ?? 'User';
  const displayEmployeeCode = meData?.employeeCode ?? storeUser?.id ?? 'N/A';
  const displayRole = meData?.role === 'ADMIN' ? 'Admin' : 'Employee';
  const displayDesignation = meData?.designation ?? 'N/A';
  const displayPhone = meData?.phone ?? 'Not provided';
  const displayEmail = meData?.email ?? storeUser?.email ?? 'Not provided';
  const displayStatus = meData?.status === 'ACTIVE' ? 'Active' : 'Deactivated';

  // Generate initials
  const initials = displayFirstName && displayLastName
    ? `${displayFirstName[0]}${displayLastName[0]}`.toUpperCase()
    : displayName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

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
    router.push('/(auth)/change-password');
  };

  // Show loading indicator only when both meLoading and no storeUser (rare case)
  const showLoadingIndicator = meLoading && !storeUser;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Navy header */}
          <View style={styles.header}>
            <TouchableOpacity activeOpacity={0.8} onPress={pickImage} style={styles.avatarWrapper}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Avatar
                  initials={initials}
                  size="lg"
                  bgColor={withAlpha(Colors.surface, 0.2)}
                  style={styles.headerAvatar}
                />
              )}
              {/* Camera badge */}
              <View style={styles.cameraBadge}>
                <Icon name="camera" size={12} color={Colors.textOnPrimary} />
              </View>
            </TouchableOpacity>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName}>{displayName}</Text>
              {showLoadingIndicator && (
                <ActivityIndicator size="small" color={Colors.surface} style={styles.nameLoader} />
              )}
            </View>
            <Text style={styles.headerId}>{displayEmployeeCode}</Text>
            <Text style={styles.headerRole}>{displayDesignation}</Text>
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
              <LinkRow icon="phone" label="Phone" value={displayPhone} />
              <View style={styles.divider} />
              <LinkRow icon="email" label="Email" value={displayEmail} />
            </Card>

            {/* Account */}
            <Card noPadding style={styles.linkCard}>
              <Text style={styles.sectionLabel}>ACCOUNT</Text>
              <LinkRow icon="lock" label="Change Password" onPress={handleChangePassword} />
              <View style={styles.divider} />
              <LinkRow icon="info" label="Status" value={displayStatus} />
            </Card>

            <Button
              label={isLoggingOut ? 'Logging out...' : 'Logout'}
              variant="outline"
              onPress={handleLogout}
              disabled={isLoggingOut}
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

const AVATAR_SIZE = 72;
const BADGE_SIZE = 24;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing[8] },

  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: Spacing[6],
    paddingBottom: Spacing[8],
  },

  // Tappable avatar with relative positioning for the badge
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.surface,
    overflow: 'hidden',
  },
  headerAvatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  headerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.surface,
    marginTop: Spacing[3],
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  nameLoader: {
    marginLeft: Spacing[1],
  },
  headerId: { fontFamily: FontFamily.medium, fontSize: 13, color: Colors.accent, marginTop: 2 },
  headerRole: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.80)',
    marginTop: 2,
  },

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
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: 14,
    gap: Spacing[3],
  },
  linkIcon: { width: 24, textAlign: 'center' },
  linkContent: { flex: 1 },
  linkLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  linkValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing[4] },

  logoutBtn: {
    borderColor: Colors.danger,
    marginTop: Spacing[2],
  },
});
