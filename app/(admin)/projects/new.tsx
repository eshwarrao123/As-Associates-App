import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/ui/Button';
import { Icon } from '../../../src/components/ui/Icon';
import { Card } from '../../../src/components/ui/Card';
import { Input } from '../../../src/components/ui/Input';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Dropdown } from '../../../src/components/ui/Dropdown';
import { useCreateProject } from '../../../src/hooks/useAdminProjects';
import { getErrorMessage } from '../../../src/services/api/errorHandler';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
  withAlpha,
} from '../../../src/constants/tokens';

// ─── Mock data ────────────────────────────────────────────────────────────────

const CLIENT_OPTIONS = ['ICICI Bank', 'Axis Bank', 'HDFC Bank', 'Kotak Mahindra', 'Commercial', 'Residential'];

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
];

interface Engineer {
  id: string;
  name: string;
  initials: string;
  role: string;
}

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Rahul Kumar', initials: 'RK', role: 'Site Engineer' },
  { id: 'e2', name: 'Anita Sharma', initials: 'AS', role: 'Civil Engineer' },
  { id: 'e3', name: 'Vikram Patel', initials: 'VP', role: 'Electrical Engineer' },
  { id: 'e4', name: 'Priya Joshi', initials: 'PJ', role: 'Project Lead' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewProjectScreen(): React.ReactElement {
  const router = useRouter();
  const createProject = useCreateProject();

  const [name, setName] = useState('');
  const [client, setClient] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [team, setTeam] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState('');

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleTeam = (id: string) =>
    setTeam((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const filteredEngineers = ENGINEERS.filter((e) =>
    e.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleSubmit = () => {
    // Basic validation
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Site address is required');
      return;
    }

    const formData = {
      name: name.trim(),
      description: description.trim() || undefined,
      location: address.trim(),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      budget: budget.trim() ? parseFloat(budget.replace(/[^0-9.]/g, '')) : undefined,
    };

    createProject.mutate(formData, {
      onSuccess: () => {
        Alert.alert('Success', 'Project created!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (err) => {
        Alert.alert('Error', getErrorMessage(err));
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top app bar — 56px navy, flat */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Project</Text>
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
              editable={!createProject.isPending}
            />
            <Dropdown
              label="Client"
              placeholder="Select client"
              value={client}
              options={CLIENT_OPTIONS}
              onSelect={setClient}
            />
            <Input
              label="Site Address"
              placeholder="Full site address"
              value={address}
              onChangeText={setAddress}
              editable={!createProject.isPending}
            />
            <Input
              label="Budget (₹)"
              placeholder="e.g. 2400000"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              editable={!createProject.isPending}
            />
            <View style={styles.dateRow}>
              <View style={styles.flex1}>
                <Text style={styles.fieldLabel}>Start Date</Text>
                <TouchableOpacity activeOpacity={0.7} style={styles.dateField}>
                  <Text style={styles.dateText}>20 Jul 2026</Text>
                  <Icon name="calendarOutline" size="sm" color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.fieldLabel}>End Date</Text>
                <TouchableOpacity activeOpacity={0.7} style={styles.dateField}>
                  <Text style={styles.datePlaceholder}>Select date</Text>
                  <Icon name="calendarOutline" size="sm" color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
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
                    disabled={createProject.isPending}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.serviceLabel}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Assign team */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>ASSIGN TEAM</Text>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search engineers..."
              placeholderTextColor={Colors.textMuted}
              editable={!createProject.isPending}
            />
            {filteredEngineers.map((e) => {
              const selected = team.includes(e.id);
              return (
                <TouchableOpacity
                  key={e.id}
                  activeOpacity={0.7}
                  onPress={() => toggleTeam(e.id)}
                  style={[styles.engineerRow, selected && styles.engineerRowActive]}
                  disabled={createProject.isPending}
                >
                  <Avatar initials={e.initials} size="sm" />
                  <View style={styles.flex1}>
                    <Text style={styles.engineerName}>{e.name}</Text>
                    <Text style={styles.engineerRole}>{e.role}</Text>
                  </View>
                  <View style={[styles.selectDot, selected && styles.selectDotActive]}>
                    {selected && <Text style={styles.selectDotText}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
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
              editable={!createProject.isPending}
            />
          </Card>

          <Button
            label={createProject.isPending ? "Creating..." : "Create Project"}
            onPress={handleSubmit}
            disabled={createProject.isPending}
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
  dateIcon: { fontSize: FontSize.base },
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

  // Team search — matches Input field spec (48px, 1px border, 8px radius, 14px padding)
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  engineerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: BorderRadius.btn,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  engineerRowActive: {
    borderColor: Colors.accent,
    backgroundColor: withAlpha(Colors.accent, 0.07),
  },
  // List item title — body-lg: 16px / 400 per DESIGN.md §14
  engineerName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  // List item subtitle — body-md: 14px / 400
  engineerRole: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  selectDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectDotActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  selectDotText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textOnAccent,
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
});
