import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { Icon } from '../../src/components/ui/Icon';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { useUploadFile } from '../../src/hooks/useUploads';
import { useMyProjects } from '../../src/hooks/useMyProjects';
import { getErrorMessage } from '../../src/services/api/errorHandler';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/tokens';

// ─── Static configuration ─────────────────────────────────────────────────────

// Service categories - domain-specific enum maintained as static config
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

  // Fetch real assigned projects
  const { data: projects, isLoading: isLoadingProjects } = useMyProjects();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedImages, setSelectedImages] = useState<
    Array<{ uri: string; name: string; type: string }>
  >([]);

  const uploadFile = useUploadFile();

  // Set default project when projects load
  React.useEffect(() => {
    if (projects && projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  // Convert projects to dropdown options
  const projectOptions = projects?.map((p) => ({
    label: `${p.name} - ${p.location}`,
    value: p.id,
  })) ?? [];

  const selectedProject = projectOptions.find((opt) => opt.value === projectId);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName ?? `upload_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      }));
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select at least one image to upload.');
      return;
    }

    // Upload all selected images sequentially
    for (const image of selectedImages) {
      uploadFile.mutate(image, {
        onError: (err) => {
          Alert.alert('Upload Error', getErrorMessage(err));
        },
      });
    }

    // After all uploads initiated, show success
    Alert.alert('Success', 'Files uploaded successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setSelectedImages([]);
          setNotes('');
        },
      },
    ]);
  };

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
              {isLoadingProjects ? (
                <View style={styles.dropdownPlaceholder}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : projectOptions.length === 0 ? (
                <View style={styles.dropdownPlaceholder}>
                  <Text style={styles.emptyText}>No projects assigned</Text>
                </View>
              ) : (
                <Dropdown
                  label="Select Project"
                  placeholder="Choose a project"
                  value={selectedProject?.label ?? null}
                  options={projectOptions.map((opt) => opt.label)}
                  onSelect={(label) => {
                    const selected = projectOptions.find((opt) => opt.label === label);
                    if (selected) setProjectId(selected.value);
                  }}
                />
              )}
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
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.dropzone}
                onPress={handlePickImage}
                disabled={uploadFile.isPending}
              >
                {uploadFile.isPending ? (
                  <ActivityIndicator size="large" color={Colors.primary} />
                ) : (
                  <>
                    <Text style={styles.dropzoneIcon}>📷</Text>
                    <Text style={styles.dropzoneText}>
                      Tap to take photo or upload from gallery
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {selectedImages.length > 0 && (
                <View style={styles.thumbRow}>
                  {selectedImages.map((img, i) => (
                    <View key={i} style={styles.thumbContainer}>
                      <Image source={{ uri: img.uri }} style={styles.thumbImage} />
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => handleRemoveImage(i)}
                        disabled={uploadFile.isPending}
                      >
                        <Text style={styles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
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
              <Button
                label={uploadFile.isPending ? 'Uploading...' : 'Submit Upload'}
                onPress={handleSubmit}
                disabled={uploadFile.isPending || selectedImages.length === 0}
              />
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
  thumbRow: { flexDirection: 'row', gap: Spacing[2], flexWrap: 'wrap' },
  thumbContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  thumbImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: Colors.textOnPrimary,
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
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
  dropdownPlaceholder: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
