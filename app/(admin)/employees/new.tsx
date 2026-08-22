import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Dropdown } from '../../../src/components/ui/Dropdown';
import { Input } from '../../../src/components/ui/Input';
import { AdminBottomNav } from '../../../src/components/ui/AdminBottomNav';
import {
  Colors,
  FontFamily,
  FontSize,
  LetterSpacing,
  Spacing,
} from '../../../src/constants/tokens';
import { useCreateEmployee } from '../../../src/hooks/useEmployees';
import { getErrorMessage } from '../../../src/services/api/errorHandler';

const DEPARTMENTS = ['Civil', 'Electrical', 'Plumbing', 'HVAC', 'General'];

export default function AddEmployeeScreen(): React.ReactElement {
  const router = useRouter();
  const createEmployee = useCreateEmployee();

  const [fullName,    setFullName]    = useState('');
  const [designation, setDesignation] = useState('');
  const [phone,       setPhone]       = useState('');
  const [email,       setEmail]       = useState('');
  const [department,  setDepartment]  = useState<string | null>(null);

  const handleSubmit = () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter full name');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    // Submit to API
    createEmployee.mutate(
      {
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        role: 'EMPLOYEE',
        designation: designation.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          Alert.alert(
            'Employee Created',
            `Employee Code: ${result.tempCredential}\n\nShare this with the employee so they can log in.`,
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ],
          );
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
          <TouchableOpacity hitSlop={12} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Employee</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Section 1: Personal Info ──────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>PERSONAL INFO</Text>
            <Input
              label="Full Name *"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              autoCapitalize="words"
              editable={!createEmployee.isPending}
            />
            <Input
              label="Role / Designation"
              value={designation}
              onChangeText={setDesignation}
              placeholder="e.g. Site Engineer"
              autoCapitalize="words"
              editable={!createEmployee.isPending}
            />
            <Input
              label="Phone Number *"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              editable={!createEmployee.isPending}
            />
            <Input
              label="Email (Optional)"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              editable={!createEmployee.isPending}
            />
          </Card>

          {/* ── Section 2: Employment ─────────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>EMPLOYMENT</Text>
            <Dropdown
              label="Department (Optional)"
              value={department}
              options={DEPARTMENTS}
              onSelect={setDepartment}
              placeholder="Select department"
            />
            <Text style={styles.note}>
              Employee will be created with ACTIVE status by default.
            </Text>
          </Card>

          {/* ── Section 3: Assign Projects ────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>ASSIGN PROJECTS</Text>
            <Text style={styles.note}>
              Projects can be assigned from the Projects screen after creating the employee.
            </Text>
          </Card>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <Button
            label={createEmployee.isPending ? 'Creating...' : 'Add Employee'}
            onPress={handleSubmit}
            disabled={createEmployee.isPending}
          />
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.cancelWrap}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>

        <AdminBottomNav activeIndex={3} />
      </SafeAreaView>
    </>
  );
}

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
  back: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textOnPrimary,
    lineHeight: 30,
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
  },

  content: {
    padding: Spacing[4],
    gap: Spacing[3],
    paddingBottom: Spacing[8],
  },

  section: { gap: Spacing[3] },

  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },

  note: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },

  cancelWrap: { alignItems: 'center', paddingVertical: Spacing[2] },
  cancelText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
