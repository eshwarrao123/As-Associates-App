import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const DEPARTMENTS = ['Civil', 'Electrical', 'Plumbing', 'HVAC', 'General'];
const STATUSES    = ['Active', 'Inactive'];

export default function AddEmployeeScreen(): React.ReactElement {
  const router = useRouter();

  const [fullName,    setFullName]    = useState('');
  const [empId,       setEmpId]       = useState('');
  const [role,        setRole]        = useState('');
  const [phone,       setPhone]       = useState('');
  const [email,       setEmail]       = useState('');
  const [department,  setDepartment]  = useState<string | null>(null);
  const [status,      setStatus]      = useState<string | null>('Active');
  const [joinDate,    setJoinDate]    = useState('');

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
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              autoCapitalize="words"
            />
            <Input
              label="Employee ID"
              value={empId}
              onChangeText={setEmpId}
              placeholder="e.g. ASA-2024-001"
              autoCapitalize="characters"
            />
            <Input
              label="Role / Designation"
              value={role}
              onChangeText={setRole}
              placeholder="e.g. Site Engineer"
              autoCapitalize="words"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
            />
          </Card>

          {/* ── Section 2: Employment ─────────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>EMPLOYMENT</Text>
            <Dropdown
              label="Department"
              value={department}
              options={DEPARTMENTS}
              onSelect={setDepartment}
              placeholder="Select department"
            />
            <Dropdown
              label="Status"
              value={status}
              options={STATUSES}
              onSelect={setStatus}
            />
            <Input
              label="Join Date"
              value={joinDate}
              onChangeText={setJoinDate}
              placeholder="DD-MM-YYYY"
              keyboardType="numeric"
            />
          </Card>

          {/* ── Section 3: Assign Projects ────────────────────────────── */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>ASSIGN PROJECTS</Text>
            <Text style={styles.note}>
              Projects can be assigned from the Projects screen.
            </Text>
          </Card>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <Button
            label="Add Employee"
            onPress={() => console.log('Add employee pressed', { fullName, empId, role, phone, email, department, status, joinDate })}
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
