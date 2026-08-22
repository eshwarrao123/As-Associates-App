import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Icon } from '../../src/components/ui/Icon';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/tokens';
import type { BadgeVariant } from '../../src/types';
import { useMyProjects } from '../../src/hooks/useMyProjects';
import { useMyRequests, useCreateRequest } from '../../src/hooks/useRequests';
import { getErrorMessage } from '../../src/services/api/errorHandler';

// ─── Types & mock data ────────────────────────────────────────────────────────

type RequestType = 'Material' | 'Issue';
type Priority = 'Low' | 'Medium' | 'High';

const REQUEST_TYPES: RequestType[] = ['Material', 'Issue'];

const PRIORITY_CONFIG: Record<Priority, string> = {
  Low: Colors.success,
  Medium: Colors.warning,
  High: Colors.danger,
};

// Map UI request types to API request types
const REQUEST_TYPE_MAP: Record<RequestType, string> = {
  Material: 'MATERIAL',
  Issue: 'ISSUE',
};

// Map API status to BadgeVariant
function mapStatusToBadge(status: string): BadgeVariant {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'pending';
  }
}

// Get type label and color from request type
function getTypeConfig(type: string): { label: string; color: string } {
  switch (type) {
    case 'MATERIAL':
      return { label: 'Material Request', color: Colors.warning };
    case 'ISSUE':
      return { label: 'Issue Report', color: Colors.danger };
    case 'LEAVE':
      return { label: 'Leave Request', color: Colors.primary };
    case 'ADVANCE':
      return { label: 'Advance Request', color: Colors.success };
    default:
      return { label: 'Request', color: Colors.textSecondary };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RequestsScreen(): React.ReactElement {
  const router = useRouter();

  // Fetch data from API
  const { data: projects, isLoading: isLoadingProjects } = useMyProjects();
  const { data: requests, isLoading: isLoadingRequests, refetch: refetchRequests } = useMyRequests();
  const createRequest = useCreateRequest();

  // Form state
  const [type, setType] = useState<RequestType>('Material');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchRequests();
    setIsRefreshing(false);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    // Build description with subject, priority, and details
    const apiType = REQUEST_TYPE_MAP[type];
    const fullDescription = `${subject}\n\nPriority: ${priority}\n\n${description}`;

    createRequest.mutate(
      {
        type: apiType,
        description: fullDescription,
        date: new Date().toISOString().split('T')[0],
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Request submitted successfully!');
          // Reset form
          setSubject('');
          setDescription('');
          setPriority('Medium');
          setType('Material');
        },
        onError: (error) => {
          Alert.alert('Error', getErrorMessage(error));
        },
      },
    );
  };

  // Format relative time (e.g., "3 days ago")
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* ── App Bar ───────────────────────────────────────────────────── */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Icon name="back" size="lg" color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Raise a Request</Text>
          <View style={styles.appBarSpacer} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
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
                  disabled={createRequest.isPending}
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
            <View>
              <Text style={styles.fieldLabel}>Select Project (Optional)</Text>
              {isLoadingProjects ? (
                <View style={[styles.dropdownPlaceholder]}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : projectOptions.length === 0 ? (
                <View style={[styles.dropdownPlaceholder]}>
                  <Text style={styles.emptyText}>No projects assigned</Text>
                </View>
              ) : (
                <Dropdown
                  label=""
                  value={selectedProject?.label ?? null}
                  options={projectOptions.map((opt) => opt.label)}
                  onSelect={(label) => {
                    const selected = projectOptions.find((opt) => opt.label === label);
                    if (selected) setProjectId(selected.value);
                  }}
                />
              )}
            </View>
            <Input
              label="Subject"
              placeholder="Brief summary of your request"
              value={subject}
              onChangeText={setSubject}
              editable={!createRequest.isPending}
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
                editable={!createRequest.isPending}
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
                    disabled={createRequest.isPending}
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
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.dropzone}
              disabled={createRequest.isPending}
            >
              <Text style={styles.dropzoneIcon}>📷</Text>
              <Text style={styles.dropzoneText}>Tap to upload photo or file</Text>
            </TouchableOpacity>
          </Card>

          <Button
            label={createRequest.isPending ? 'Submitting...' : 'Submit Request'}
            onPress={handleSubmit}
            disabled={createRequest.isPending}
          />

          {/* Existing requests */}
          <Text style={styles.recentHeading}>My Recent Requests</Text>

          {isLoadingRequests ? (
            <Card style={styles.loadingCard}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </Card>
          ) : !requests || requests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>No requests submitted yet.</Text>
            </Card>
          ) : (
            requests.map((req) => {
              const typeConfig = getTypeConfig(req.type);
              const status = mapStatusToBadge(req.status);
              // Extract title from description (first line)
              const title = req.description.split('\n')[0] || 'Request';

              return (
                <Card key={req.id} style={styles.requestCard}>
                  <View style={styles.requestTop}>
                    <View style={[styles.dot, { backgroundColor: typeConfig.color }]} />
                    <View style={[styles.typeChip, { backgroundColor: `${typeConfig.color}18` }]}>
                      <Text style={[styles.typeChipText, { color: typeConfig.color }]}>
                        {typeConfig.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.requestTitle}>{title}</Text>
                  <View style={styles.requestFooter}>
                    <Badge variant={status} />
                    <Text style={styles.requestAge}>{formatRelativeTime(req.createdAt)}</Text>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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

  // Loading and empty states
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[6],
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[6],
  },
  emptyCardText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  dropdownPlaceholder: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.btn,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
});
