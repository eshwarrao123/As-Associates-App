import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Icon } from '../../src/components/ui/Icon';
import { useAuthStore } from '../../src/store/auth.store';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadow } from '../../src/constants/tokens';
import * as authService from '../../src/services/auth/authService';
import { getErrorMessage } from '../../src/services/api/errorHandler';

// ─── Validation schema ────────────────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChangePasswordScreen(): React.ReactElement {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  // Watch password fields to clear mismatch error when user types
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    // Clear password mismatch error when user starts typing
    if (error === 'Passwords do not match' && newPassword && confirmPassword) {
      setError(null);
    }
  }, [newPassword, confirmPassword, error]);

  // Block back navigation when mustChangePassword is true
  useFocusEffect(
    React.useCallback(() => {
      if (user?.mustChangePassword) {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
          // Block Android back button
          return true;
        });

        return () => backHandler.remove();
      }
    }, [user?.mustChangePassword])
  );

  const onSubmit = async (data: ChangePasswordFormData): Promise<void> => {
    // Client-side validation: passwords must match
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.changePassword(data.currentPassword, data.newPassword);

      // Update mustChangePassword to false in the store
      if (user) {
        const updatedUser = { ...user, mustChangePassword: false };
        setUser(updatedUser);
      }

      // Navigate to the correct home screen based on role
      if (user?.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(employee)');
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: !user?.mustChangePassword,
          headerTitle: 'Change Password',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.textOnPrimary,
          headerTitleStyle: {
            fontFamily: FontFamily.bold,
            fontSize: FontSize.lg,
          },
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ─── Card ──────────────────────────────────────────────────── */}
            <View style={styles.card}>
            {/* Heading */}
            <Text style={styles.heading}>Change Password</Text>
            <Text style={styles.subheading}>
              {user?.mustChangePassword
                ? 'For security, you must set a new password before continuing.'
                : 'Update your account password'}
            </Text>

            {/* Form */}
            <View style={styles.form}>
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Current Password"
                    placeholder="Enter current password"
                    secureTextEntry
                    secureToggle
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.currentPassword?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />

              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="New Password"
                    placeholder="Enter new password (min 8 characters)"
                    secureTextEntry
                    secureToggle
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.newPassword?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirm New Password"
                    placeholder="Re-enter new password"
                    secureTextEntry
                    secureToggle
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.confirmPassword?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />

              {/* Global error */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Update button */}
              <Button
                label={isLoading ? 'Updating...' : 'Update Password'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.submitBtn}
              />
            </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[8],
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[6],
    width: '100%',
    maxWidth: 420,
    ...Shadow.card,
  },
  heading: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    lineHeight: 28,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing[1],
  },
  subheading: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  form: {
    gap: 4,
  },
  inputContainer: {
    marginBottom: Spacing[3],
  },
  errorText: {
    color: Colors.danger,
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: FontFamily.medium,
  },
  submitBtn: {
    marginTop: Spacing[2],
  },
});
