import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../../../src/components/ui/Button';
import { Icon } from '../../../../src/components/ui/Icon';
import { Card } from '../../../../src/components/ui/Card';
import { Input } from '../../../../src/components/ui/Input';
import { useAdminProject, useUpdateProject } from '../../../../src/hooks/useAdminProjects';
import { getErrorMessage } from '../../../../src/services/api/errorHandler';
import { formatLocalDateKey } from '../../../../src/utils/date';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
  withAlpha,
} from '../../../../src/constants/tokens';

// ─── Static configuration ─────────────────────────────────────────────────────

// Service categories - domain-specific enum maintained as static config
const SERVICES = [
  'Civil',
  'Electrical',
  'Painting',
  'HVAC',
  'Plumbing',
  'False Ceiling',
  'Furniture',
  'Signage',
  'Flooring',
  'Fire Safety',
  'Other',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditProjectScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading: isLoadingProject } = useAdminProject(id ?? '');
  const updateProject = useUpdateProject();

  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [address, setAddress] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState('');
  const [progressPercent, setProgressPercent] = useState('0');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Pre-fill form when project data loads
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setClient(project.client || '');
      setAddress(project.location || '');
      setDescription(project.scope || '');
      setServices(project.services || []);
      setCustomService(project.customService || '');
      setProgressPercent(String(project.progress ?? 0));

      // Parse start date from YYYY-MM-DD string
      if (project.startDate) {
        const parsedStart = new Date(project.startDate + 'T00:00:00.000');
        setStartDate(parsedStart);
      }

      // Parse end date from YYYY-MM-DD string
      if (project.targetEnd && project.targetEnd !== 'Not set') {
        const parsedEnd = new Date(project.targetEnd + 'T00:00:00.000');
        setEndDate(parsedEnd);
      }

      // Budget is not currently in the project detail response, so leave empty
      setBudget('');
    }
  }, [project]);

  const toggleService = (s: string) => {
    setServices((prev) => {
      if (prev.includes(s)) {
        // Unchecking "Other" should clear customService
        if (s === 'Other') {
          setCustomService('');
        }
        return prev.filter((x) => x !== s);
      }
      return [...prev, s];
    });
  };

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // If end date is set and is before the new start date, clear it
      if (endDate && selectedDate > endDate) {
        setEndDate(null);
      }
    }
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      // Validate that end date is not before start date
      if (selectedDate < startDate) {
        Alert.alert('Invalid Date', 'End date cannot be earlier than start date');
        return;
      }
      setEndDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    // Basic validation
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }
    if (!client.trim()) {
      Alert.alert('Error', 'Client name is required');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Site address is required');
      return;
    }
    if (services.includes('Other') && !customService.trim()) {
      Alert.alert('Error', 'Please specify the custom service when "Other" is selected');
      return;
    }

    const progressValue = parseInt(progressPercent, 10);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      Alert.alert('Error', 'Progress must be between 0 and 100');
      return;
    }

    const formData = {
      name: name.trim(),
      clientName: client.trim(),
      description: description.trim() || undefined,
      location: address.trim(),
      services: services.filter((s) => s !== 'Other'),
      customService: services.includes('Other') ? customService.trim() : undefined,
      startDate: formatLocalDateKey(startDate),
      endDate: endDate ? formatLocalDateKey(endDate) : undefined,
      budget: budget.trim() ? parseFloat(budget.replace(/[^0-9.]/g, '')) : undefined,
      progressPercent: progressValue,
    };

    updateProject.mutate(
      { id: id ?? '', data: formData },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Project updated successfully!', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert('Error', getErrorMessage(err));
        },
      },
    );
  };

  if (isLoadingProject) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
              <Text style={styles.back}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Project</Text>
            <View style={styles.backSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
              <Text style={styles.back}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Project</Text>
            <View style={styles.backSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Failed to load project details</Text>
            <Button label="Go Back" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — 56px navy, flat */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Project</Text>
          <View style={styles.backSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Project details */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>PROJECT DETAILS</Text>
            <Input
              label="Project Name"
              placeholder="e.g. ICICI Bank HQ - Andheri"
              value={name}
              onChangeText={setName}
              editable={!updateProject.isPending}
            />
            <Input
              label="Client Name"
              placeholder="e.g. ICICI Bank"
              value={client}
              onChangeText={setClient}
              editable={!updateProject.isPending}
            />
            <Input
              label="Site Address"
              placeholder="Full site address"
              value={address}
              onChangeText={setAddress}
              editable={!updateProject.isPending}
            />
            <Input
              label="Budget (₹)"
              placeholder="e.g. 2400000"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              editable={!updateProject.isPending}
            />
            <Input
              label="Progress (%)"
              placeholder="0-100"
              value={progressPercent}
              onChangeText={setProgressPercent}
              keyboardType="number-pad"
              editable={!updateProject.isPending}
            />
            <View style={styles.dateRow}>
              <View style={styles.flex1}>
                <Text style={styles.fieldLabel}>Start Date</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.dateField}
                  onPress={() => setShowStartPicker(true)}
                  disabled={updateProject.isPending}
                >
                  <Text style={styles.dateText}>
                    {startDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <Icon name="calendarOutline" size="sm" color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.fieldLabel}>End Date (Optional)</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.dateField}
                  onPress={() => setShowEndPicker(true)}
                  disabled={updateProject.isPending}
                >
                  <Text style={endDate ? styles.dateText : styles.datePlaceholder}>
                    {endDate
                      ? endDate.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Select date'}
                  </Text>
                  <Icon name="calendarOutline" size="sm" color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'android' ? 'default' : 'spinner'}
                onValueChange={handleStartDateChange}
                onDismiss={() => setShowStartPicker(false)}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display={Platform.OS === 'android' ? 'default' : 'spinner'}
                onValueChange={handleEndDateChange}
                onDismiss={() => setShowEndPicker(false)}
                minimumDate={startDate}
              />
            )}
          </Card>

          {/* Services required */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>SERVICES REQUIRED</Text>
            <View style={styles.serviceGrid}>
              {SERVICES.map((s) => {
                const checked = services.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    activeOpacity={0.7}
                    style={styles.serviceItem}
                    onPress={() => toggleService(s)}
                    disabled={updateProject.isPending}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.serviceLabel}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {services.includes('Other') && (
              <Input
                label="Specify Custom Service"
                placeholder="e.g. Landscaping, Waterproofing"
                value={customService}
                onChangeText={setCustomService}
                editable={!updateProject.isPending}
              />
            )}
          </Card>

          {/* Description */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>DESCRIPTION</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Project scope and notes..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
              editable={!updateProject.isPending}
            />
          </Card>

          <Button
            label={updateProject.isPending ? "Updating..." : "Save Changes"}
            onPress={handleSubmit}
            disabled={updateProject.isPending}
          />
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
  },
  back: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textOnPrimary,
    lineHeight: 30,
  },
  backSpacer: { width: 20 },
  // headline-sm: 18px / bold
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },

  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },
  section: { gap: Spacing[3] },

  // Overline: xs (11px) / medium / wider letter-spacing / muted color
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },

  // label-md: 14px / 500
  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: 6,
  },

  // Date picker row — two equal-width fields
  dateRow: { flexDirection: 'row', gap: Spacing[3] },
  dateField: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  // body-lg: 16px / 400
  dateText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  datePlaceholder: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },

  // Services checkbox grid — 2 columns
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  serviceItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkmark: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textOnAccent,
  },
  // body-md: 14px / 400
  serviceLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  // Text area — min-height 120px per DESIGN.md §7
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
    padding: 14,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
