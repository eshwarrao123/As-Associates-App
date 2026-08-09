import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

// ─── Mock data (mirrors employees/index.tsx) ──────────────────────────────────

interface EmployeeFormData {
  id: string;
  fullName: string;
  empId: string;
  designation: string;
  phone: string;
  email: string;
  department: string;
  status: string;
  joinDate: string;
}

const EMPLOYEES: EmployeeFormData[] = [
  { id: '1', fullName: 'Rahul Kumar',  empId: 'ASA-2024-047', designation: 'Site Engineer',      phone: '+91 98765 43210', email: 'rahul.kumar@asassociates.com',  department: 'Civil',       status: 'Active',   joinDate: '15-03-2024' },
  { id: '2', fullName: 'Anita Sharma', empId: 'ASA-2024-051', designation: 'Civil Engineer',      phone: '+91 91234 56789', email: 'anita.sharma@asassociates.com', department: 'Civil',       status: 'Active',   joinDate: '22-04-2024' },
  { id: '3', fullName: 'Vikram Patel', empId: 'ASA-2023-018', designation: 'Electrical Engineer', phone: '+91 99887 76655', email: 'vikram.patel@asassociates.com', department: 'Electrical',  status: 'Active',   joinDate: '08-07-2023' },
  { id: '4', fullName: 'Priya Joshi',  empId: 'ASA-2022-009', designation: 'Project Lead',        phone: '+91 90011 22334', email: 'priya.joshi@asassociates.com',  department: 'Civil',       status: 'Active',   joinDate: '01-02-2022' },
  { id: '5', fullName: 'Manish Rao',   empId: 'ASA-2024-063', designation: 'Junior Engineer',     phone: '+91 88001 23456', email: 'manish.rao@asassociates.com',   department: 'General',     status: 'Inactive', joinDate: '10-06-2024' },
];

const DEPARTMENTS = ['Civil', 'Electrical', 'Plumbing', 'HVAC', 'General'];
const STATUSES    = ['Active', 'Inactive'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditEmployeeScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const seed = EMPLOYEES.find((e) => e.id === id) ?? EMPLOYEES[0];

  const [fullName,    setFullName]    = useState(seed.fullName);
  const [empId,       setEmpId]       = useState(seed.empId);
  const [designation, setDesignation] = useState(seed.designation);
  const [phone,       setPhone]       = useState(seed.phone);
  const [email,       setEmail]       = useState(seed.email);
  const [department,  setDepartment]  = useState<string | null>(seed.department);
  const [status,      setStatus]      = useState<string | null>(seed.status);
  const [joinDate,    setJoinDate]    = useState(seed.joinDate);

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
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            autoCapitalize="words"
            containerStyle={styles.field}
          />
          <Input
            label="Employee ID"
            value={empId}
            onChangeText={setEmpId}
            placeholder="e.g. ASA-2024-001"
            autoCapitalize="characters"
            containerStyle={styles.field}
          />
          <Input
            label="Role / Designation"
            value={designation}
            onChangeText={setDesignation}
            placeholder="e.g. Site Engineer"
            autoCapitalize="words"
            containerStyle={styles.field}
          />
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            containerStyle={styles.field}
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            containerStyle={styles.field}
          />

          {/* Section 2 — Employment */}
          <Text style={[styles.sectionLabel, styles.sectionGap]}>EMPLOYMENT</Text>

          <Dropdown
            label="Department"
            value={department}
            options={DEPARTMENTS}
            onSelect={setDepartment}
            placeholder="Select department"
            containerStyle={styles.field}
          />
          <Dropdown
            label="Status"
            value={status}
            options={STATUSES}
            onSelect={setStatus}
            containerStyle={styles.field}
          />
          <Input
            label="Join Date"
            value={joinDate}
            onChangeText={setJoinDate}
            placeholder="DD-MM-YYYY"
            keyboardType="numeric"
            containerStyle={styles.field}
          />

          {/* Footer */}
          <Button
            label="Save Changes"
            onPress={() => {
              console.log('Save employee:', { id, fullName, empId, designation, phone, email, department, status, joinDate });
              router.back();
            }}
            style={styles.submitBtn}
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

  submitBtn: { marginTop: Spacing[5] },
  cancelRow: { alignItems: 'center', paddingVertical: Spacing[3] },
  cancelText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
