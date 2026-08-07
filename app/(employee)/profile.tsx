import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Icon } from '../../src/components/ui/Icon';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { useAuthStore } from '../../src/store/auth.store';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, withAlpha } from '../../src/constants/tokens';

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
  const [photoUri, setPhotoUri] = useState<string | null>(null);

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
                <Avatar initials="RK" size="lg" bgColor={withAlpha(Colors.surface, 0.20)} style={styles.headerAvatar} />
              )}
              {/* Camera badge */}
              <View style={styles.cameraBadge}>
                <Icon name="camera" size={12} color={Colors.textOnPrimary} />
              </View>
            </TouchableOpacity>
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
