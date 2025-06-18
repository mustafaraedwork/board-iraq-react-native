// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService, LoginCredentials } from '../../services/auth';
import { colors, spacing } from '../../styles/colors';

// Schema للتحقق من المدخلات
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'اسم المستخدم مطلوب')
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(3, 'كلمة المرور يجب أن تكون 3 أحرف على الأقل'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const credentials: LoginCredentials = {
        username: data.username.trim(),
        password: data.password,
      };

      const response = await authService.login(credentials);

      if (response.success && response.user) {
        // نجح تسجيل الدخول
        Alert.alert(
          'مرحباً بك!',
          `أهلاً ${response.user.full_name || response.user.username}`,
          [
            {
              text: 'متابعة',
              onPress: () => {
                reset(); // مسح النموذج
                onLoginSuccess(); // الانتقال للشاشة الرئيسية
              },
            },
          ]
        );
      } else {
        // فشل تسجيل الدخول
        Alert.alert(
          'خطأ في تسجيل الدخول',
          response.error || 'حدث خطأ غير متوقع',
          [{ text: 'حسناً' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'خطأ في الاتصال',
        'تحقق من اتصال الإنترنت وحاول مرة أخرى',
        [{ text: 'حسناً' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoData = () => {
    reset({
      username: 'demo123',
      password: 'demo123',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.title}>Board Iraq</Title>
          <Paragraph style={styles.subtitle}>البطاقات الذكية</Paragraph>
          <Text style={styles.description}>
            سجل دخولك للوصول إلى لوحة التحكم
          </Text>
        </View>

        {/* Login Form */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>تسجيل الدخول</Title>

            {/* Username Field */}
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="اسم المستخدم"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.username}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  disabled={isLoading}
                  right={<TextInput.Icon icon="account" />}
                />
              )}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username.message}</Text>
            )}

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="كلمة المرور"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.password}
                  style={styles.input}
                  secureTextEntry
                  disabled={isLoading}
                  right={<TextInput.Icon icon="lock" />}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              disabled={!isValid || isLoading}
              loading={isLoading}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            {/* Demo Button */}
            <Button
              mode="outlined"
              onPress={fillDemoData}
              style={styles.demoButton}
              disabled={isLoading}
            >
              تجربة الحساب التجريبي
            </Button>
          </Card.Content>
        </Card>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>جاري التحقق من البيانات...</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Board Iraq © 2025
          </Text>
          <Text style={styles.footerContact}>
            للدعم: {process.env.EXPO_PUBLIC_CONTACT_PHONE}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
    elevation: 4,
    backgroundColor: colors.white,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.text,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  demoButton: {
    borderColor: colors.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.gray[600],
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.gray[500],
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  footerContact: {
    color: colors.gray[500],
    fontSize: 12,
  },
});