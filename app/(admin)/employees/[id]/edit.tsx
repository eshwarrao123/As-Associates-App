import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../../src/components/ui/Button';
import { Dropdown } from '../../../../src/components/ui/Dropdown';
import { Input } from '../../../../src/components/ui/Input';
import { Icon } from '../../../../src/components/ui/Icon';
import { AdminBottomNav } from '../../../../src/components/ui/AdminBottomNav';
import {
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
} from '../../../../src/constants/tokens';
import { useEmployee, useUpdateEmployee } from '../../../../src/hooks/useEmployees';
import { getErrorMessage } from '../../../../src/services/api/errorHandler';

const DEPARTMENTS = ['Civil', 'Electrical', 'Plumbing', 'HVAC', 'General'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditEmployeeScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch employee data
  const { data: employee, isLoading } = useEmployee(id ?? '');
  const updateEmployee = useUpdateEmployee();

  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<string | null>(null);

  // Prefill form when employee data loads
  React.useEffect(() => {
    if (employee) {
      setFullName(`${employee.firstName} ${employee.lastName}`);
      setDesignation(employee.designation ?? '');
      setPhone(employee.phone ?? '');
      setEmail(employee.email ?? '');
      setDepartment(employee.department ?? null);
    }
  }, [employee]);

  const handleSubmit = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter full name');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    updateEmployee.mutate(
      {
        id: id ?? '',
        data: {
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          designation: designation.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Employee updated successfully', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', getErrorMessage(error));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
              <Icon name="back" size="lg" color={Colors.textOnPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Employee</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
          <AdminBottomNav activeIndex={3} />
        </SafeAreaView>
      </>
    );
  }

  if (!employee) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
              <Icon name="back" size="lg" color={Colors.textOnPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Employee</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Employee not found.</Text>
          </View>
          <AdminBottomNav activeIndex={3} />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Navy header */}
        <View style={styles.header}>
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Icon name="back" size="lg" color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Employee</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section 1 — Personal Info */}
          <Text style={styles.sectionLabel}>PERSONAL INFO</Text>

          <Input
            label="Full Name *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            autoCapitalize="words"
            containerStyle={styles.field}
            editable={!updateEmployee.isPending}
          />
          <Input
            label="Role / Designation"
            value={designation}
            onChangeText={setDesignation}
            placeholder="e.g. Site Engineer"
            autoCapitalize="words"
            containerStyle={styles.field}
            editable={!updateEmployee.isPending}
          />
          <Input
            label="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            containerStyle={styles.field}
            editable={!updateEmployee.isPending}
          />
          <Input
            label="Email (Optional)"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            containerStyle={styles.field}
            editable={!updateEmployee.isPending}
          />

          {/* Section 2 — Employment */}
          <Text style={[styles.sectionLabel, styles.sectionGap]}>EMPLOYMENT</Text>

          <Text style={styles.note}>
            Employee Code: {employee.employeeCode ?? 'N/A'}
          </Text>
          <Text style={styles.note}>
            Status: {employee.status}
          </Text>
          <Text style={[styles.note, styles.noteSubtle]}>
            Status can be changed from the employee detail screen.
          </Text>

          {/* Footer */}
          <Button
            label={updateEmployee.isPending ? 'Saving...' : 'Save Changes'}
            onPress={handleSubmit}
            style={styles.submitBtn}
            disabled={updateEmployee.isPending}
          />
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.cancelRow}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>

        <AdminBottomNav activeIndex={3} />
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },
  headerSpacer: { width: 24 },

  content: { padding: Spacing[4], paddingBottom: Spacing[8] },

  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing[3],
  },
  sectionGap: { marginTop: Spacing[5] },

  field: { marginBottom: Spacing[3] },

  note: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  noteSubtle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  submitBtn: { marginTop: Spacing[5] },
  cancelRow: { alignItems: 'center', paddingVertical: Spacing[3] },
  cancelText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
