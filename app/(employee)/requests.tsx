import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/tokens';
import type { BadgeVariant } from '../../src/types';

// ─── Types & mock data ────────────────────────────────────────────────────────

type RequestType = 'Material' | 'Issue' | 'Support';
type Priority = 'Low' | 'Medium' | 'High';

const REQUEST_TYPES: RequestType[] = ['Material', 'Issue', 'Support'];

const PROJECT_OPTIONS = [
  'ICICI Bank HQ - Andheri',
  'Axis Bank - Bandra',
  'HDFC Bank - Powai',
];

const PRIORITY_CONFIG: Record<Priority, string> = {
  Low: Colors.success,
  Medium: Colors.warning,
  High: Colors.danger,
};

interface RecentRequest {
  id: string;
  dotColor: string;
  typeLabel: string;
  typeColor: string;
  title: string;
  project: string;
  status: BadgeVariant;
  age: string;
}

const RECENT_REQUESTS: RecentRequest[] = [
  {
    id: 'r1',
    dotColor: Colors.warning,
    typeLabel: 'Material Request',
    typeColor: Colors.warning,
    title: 'Cement Bags x50',
    project: 'HDFC Bank - Powai',
    status: 'pending',
    age: '3 days ago',
  },
  {
    id: 'r2',
    dotColor: Colors.success,
    typeLabel: 'Issue Report',
    typeColor: Colors.success,
    title: 'Electrical wiring fault',
    project: 'Axis Bank - Bandra',
    status: 'approved',
    age: '1 week ago',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RequestsScreen(): React.ReactElement {
  const [type, setType] = useState<RequestType>('Material');
  const [project, setProject] = useState<string | null>(PROJECT_OPTIONS[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');

  return (
    <>
      <Stack.Screen options={{ title: 'Raise a Request' }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Request type segmented control */}
          <View style={styles.segment}>
            {REQUEST_TYPES.map((t) => {
              const active = type === t;
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.8}
                  onPress={() => setType(t)}
                  style={[styles.segmentItem, active ? styles.segmentActive : styles.segmentInactive]}
                >
                  <Text style={active ? styles.segmentTextActive : styles.segmentTextInactive}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Request details */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>REQUEST DETAILS</Text>
            <Dropdown
              label="Select Project"
              value={project}
              options={PROJECT_OPTIONS}
              onSelect={setProject}
            />
            <Input
              label="Subject"
              placeholder="Brief summary of your request"
              value={subject}
              onChangeText={setSubject}
            />
            <View>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                placeholder="Provide detailed information..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
            </View>
          </Card>

          {/* Priority */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>PRIORITY</Text>
            <View style={styles.priorityRow}>
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                const color = PRIORITY_CONFIG[p];
                const active = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    activeOpacity={0.8}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.priorityChip,
                      active
                        ? { backgroundColor: color, borderColor: color }
                        : { backgroundColor: Colors.surface, borderColor: color },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: active ? Colors.surface : color },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Attachments */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>ATTACHMENTS (OPTIONAL)</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.dropzone}>
              <Text style={styles.dropzoneIcon}>📷</Text>
              <Text style={styles.dropzoneText}>Tap to upload photo or file</Text>
            </TouchableOpacity>
          </Card>

          <Button label="Submit Request" onPress={() => {}} />

          {/* Existing requests */}
          <Text style={styles.recentHeading}>My Recent Requests</Text>
          {RECENT_REQUESTS.map((req) => (
            <Card key={req.id} style={styles.requestCard}>
              <View style={styles.requestTop}>
                <View style={[styles.dot, { backgroundColor: req.dotColor }]} />
                <View style={[styles.typeChip, { backgroundColor: `${req.typeColor}18` }]}>
                  <Text style={[styles.typeChipText, { color: req.typeColor }]}>
                    {req.typeLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.requestTitle}>{req.title}</Text>
              <Text style={styles.requestProject}>{req.project}</Text>
              <View style={styles.requestFooter}>
                <Badge variant={req.status} />
                <Text style={styles.requestAge}>{req.age}</Text>
              </View>
            </Card>
          ))}
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[8] },
  section: { gap: Spacing[3] },
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.textSecondary,
  },

  // Segmented control
  segment: { flexDirection: 'row', gap: Spacing[2] },
  segmentItem: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: { backgroundColor: Colors.primary },
  segmentInactive: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  segmentTextActive: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.surface },
  segmentTextInactive: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },

  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
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

  // Priority
  priorityRow: { flexDirection: 'row', gap: Spacing[2] },
  priorityChip: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.btn,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm },

  // Attachments
  dropzone: {
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dropzoneIcon: { fontSize: 22 },
  dropzoneText: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },

  // Recent requests
  recentHeading: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginTop: Spacing[2],
  },
  requestCard: { gap: Spacing[2] },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  dot: { width: 8, height: 8, borderRadius: 4 },
  typeChip: { borderRadius: BorderRadius.badge, paddingHorizontal: 10, paddingVertical: 3 },
  typeChipText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs },
  requestTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  requestProject: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },
  requestFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  requestAge: { fontFamily: FontFamily.regular, fontSize: 11, color: '#9CA3AF' },
});
