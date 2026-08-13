import React, { useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { Icon } from '../../src/components/ui/Icon';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

const PROJECT_OPTIONS = [
  'ICICI Bank HQ - Andheri',
  'Axis Bank - Bandra',
  'HDFC Bank - Powai',
];

const CATEGORY_OPTIONS = [
  'Civil',
  'Electrical',
  'Painting',
  'HVAC',
  'Plumbing',
  'False Ceiling',
  'Furniture',
  'Signage',
];

const TODAY = new Date().toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function UploadScreen(): React.ReactElement {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const formOffsetY = useRef(0);

  const [project, setProject] = React.useState<string | null>(PROJECT_OPTIONS[0]);
  const [category, setCategory] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* ── App Bar ───────────────────────────────────────────────── */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Icon name="back" size="lg" color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Field Submissions</Text>
          <View style={styles.appBarSpacer} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Part 1: Hub ───────────────────────────────────────────────── */}
          <Text style={styles.subtitle}>What would you like to submit?</Text>

          {/* Two equal-width action cards */}
          <View style={styles.hubRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.hubCard}
              onPress={() =>
                scrollRef.current?.scrollTo({ y: formOffsetY.current, animated: true })
              }
            >
              <Icon name="camera" size="xl" color={Colors.primary} />
              <Text style={styles.hubLabel}>Upload Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.hubCard}
              onPress={() => router.push('/(employee)/progress')}
            >
              <Icon name="progress" size="xl" color={Colors.primary} />
              <Text style={styles.hubLabel}>Daily Progress</Text>
            </TouchableOpacity>
          </View>

          {/* Full-width action card */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.hubCardWide}
            onPress={() => router.push('/(employee)/requests')}
          >
            <Icon name="document" size="xl" color={Colors.primary} />
            <Text style={styles.hubLabel}>Raise a Request</Text>
          </TouchableOpacity>

          {/* ── Part 2: Upload Form ───────────────────────────────────────── */}
          <View
            onLayout={(e) => { formOffsetY.current = e.nativeEvent.layout.y; }}
          >
            {/* Card 1 — Project Info */}
            <Card style={styles.section}>
              <Text style={styles.sectionLabel}>PROJECT INFO</Text>
              <Dropdown
                label="Select Project"
                placeholder="Choose a project"
                value={project}
                options={PROJECT_OPTIONS}
                onSelect={setProject}
              />
              <Dropdown
                label="Select Work Category"
                placeholder="Choose a category"
                value={category}
                options={CATEGORY_OPTIONS}
                onSelect={setCategory}
              />
            </Card>

            {/* Card 2 — Photos */}
            <Card style={styles.sectionWithGap}>
              <Text style={styles.sectionLabel}>PHOTOS</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.dropzone}>
                <Text style={styles.dropzoneIcon}>📷</Text>
                <Text style={styles.dropzoneText}>
                  Tap to take photo or upload from gallery
                </Text>
              </TouchableOpacity>
              <View style={styles.thumbRow}>
                {[0, 1].map((i) => (
                  <View key={i} style={styles.thumb}>
                    <Text style={styles.thumbIcon}>📷</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Card 3 — Work Notes */}
            <Card style={styles.sectionWithGap}>
              <Text style={styles.sectionLabel}>NOTES</Text>
              <TextArea
                value={notes}
                onChangeText={setNotes}
                placeholder="Describe work done today..."
              />
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Date</Text>
                <Text style={styles.dateValue}>{TODAY}</Text>
              </View>
            </Card>

            <View style={styles.sectionWithGap}>
              <Button label="Submit Upload" onPress={() => {}} />
            </View>
          </View>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Local textarea ───────────────────────────────────────────────────────────

const TextArea: React.FC<{
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
}> = ({ value, onChangeText, placeholder }) => (
  <TextInput
    style={styles.textArea}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={Colors.textSecondary}
    multiline
    textAlignVertical="top"
  />
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // App bar — matches requests.tsx and progress.tsx navy header pattern
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
    textAlign: 'center',
  },
  appBarSpacer: { width: 24 },

  content: { padding: Spacing[4], paddingBottom: Spacing[8] },

  // ── Hub ─────────────────────────────────────────────────────────────────────
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: Spacing[3],
  },
  hubRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  hubCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[5],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hubCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[4],
    marginBottom: Spacing[6],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hubLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // ── Form ────────────────────────────────────────────────────────────────────
  section: { gap: Spacing[3] },
  sectionWithGap: { gap: Spacing[3], marginTop: Spacing[3] },
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    color: Colors.textSecondary,
  },
  dropzone: {
    height: 160,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
  },
  dropzoneIcon: { fontSize: 32 },
  dropzoneText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  thumbRow: { flexDirection: 'row', gap: Spacing[2] },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIcon: { fontSize: 20 },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
    padding: 14,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  dateValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
