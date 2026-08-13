import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/store/auth.store';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadow } from '../../src/constants/tokens';
import { User } from '../../src/types';

// ─── Validation schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Mock user database ───────────────────────────────────────────────────────

const MOCK_USERS: Record<string, User & { password: string; token: string }> = {
  'admin@asassociates.com': {
    id: 'usr_admin_001',
    name: 'Admin User',
    email: 'admin@asassociates.com',
    role: 'admin',
    department: 'Management',
    avatarInitials: 'AU',
    password: 'admin123',
    token: 'mock_token_admin_xyz_2024',
  },
  'rahul@asassociates.com': {
    id: 'usr_emp_001',
    name: 'Rahul Sharma',
    email: 'rahul@asassociates.com',
    role: 'employee',
    department: 'Engineering',
    avatarInitials: 'RS',
    password: 'rahul123',
    token: 'mock_token_emp_abc_2024',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginScreen(): React.ReactElement {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setLoginError(null);

    // Simulate network delay
    await new Promise<void>((resolve) => setTimeout(resolve, 800));

    const mockUser = MOCK_USERS[data.email.toLowerCase()];

    if (!mockUser || mockUser.password !== data.password) {
      setLoginError('Invalid email or password. Please try again.');
      return;
    }

    const { password: _, token, ...user } = mockUser;
    setToken(token);
    setUser(user);

    // Navigate based on role
    if (user.role === 'admin') {
      router.replace('/(admin)');
    } else {
      router.replace('/(employee)');
    }
  };

  return (
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
            {/* Logo */}
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/logo-icon.png')}
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>AS Associates</Text>
            </View>

            {/* Heading */}
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>Sign in to continue to your workspace</Text>

            {/* Form */}
            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="you@asassociates.com"
                    keyboardType="email-address"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.email?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="••••••••"
                    secureTextEntry
                    secureToggle
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.password?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />

              {/* Global error */}
              {loginError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{loginError}</Text>
                </View>
              ) : null}

              {/* Sign In button */}
              <Button
                label="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                style={styles.signInBtn}
              />

              {/* Forgot password */}
              <TouchableOpacity style={styles.forgotWrapper} hitSlop={{ top: 8, bottom: 8 }}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>© 2024 AS Associates. All rights reserved.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  logoWrapper: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  logoText: {
    fontFamily: FontFamily.extraBold,
    fontSize: 32,
    color: Colors.surface,
  },
  brandName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.primary,
    letterSpacing: 0.5,
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
  errorBanner: {
    backgroundColor: `${Colors.danger}26`,
    borderRadius: BorderRadius.btn,
    padding: Spacing[3],
    marginBottom: Spacing[3],
  },
  errorBannerText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.danger,
    textAlign: 'center',
  },
  signInBtn: {
    marginTop: Spacing[2],
    marginBottom: Spacing[4],
  },
  forgotWrapper: {
    alignItems: 'center',
  },
  forgotText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  footer: {
    marginTop: Spacing[6],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
