// src/screens/auth/LoginScreen.tsx - إصدار محدث لإصلاح مشكلة الانتقال
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  I18nManager,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
  Text,
  Surface,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { authService } from '../../services/auth';

// Props interface
export interface LoginScreenProps {
  onLoginSuccess: () => void;
}

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    
    try {
      console.log('🔑 بدء تسجيل الدخول...', data.username);
      
      const result = await authService.login(data.username, data.password);

      if (result.success && result.user) {
        console.log('✅ تسجيل الدخول ناجح!');
        
        // فرض إعادة تحميل حالة المصادقة
        await authService.forceRefreshAuthState();
        
        Alert.alert(
          'مرحباً!',
          `مرحباً ${result.user.full_name || result.user.username}! تم تسجيل الدخول بنجاح`,
          [
            {
              text: 'متابعة',
              onPress: () => {
                console.log('🚀 استدعاء onLoginSuccess...');
                onLoginSuccess();
              }
            }
          ]
        );
      } else {
        console.log('❌ فشل تسجيل الدخول:', result.error);
        Alert.alert('خطأ في تسجيل الدخول', result.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
      Alert.alert('خطأ', 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setValue('username', 'demo123');
    setValue('password', 'demo123');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Surface style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons
              name="card-account-details"
              size={48}
              color="white"
            />
          </Surface>
          <Title style={[styles.title, { color: theme.colors.primary }]}>
            Board Iraq
          </Title>
          <Paragraph style={styles.subtitle}>
            تسجيل الدخول إلى حسابك
          </Paragraph>
        </View>

        {/* Login Form */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.formTitle}>تسجيل الدخول</Title>

            {/* Username Field */}
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="اسم المستخدم"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.username}
                  autoCapitalize="none"
                  autoCorrect={false}
                  left={<TextInput.Icon icon="account" />}
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
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="كلمة المرور"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.password}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  left={<TextInput.Icon icon="lock" />}
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
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              icon="login"
              contentStyle={styles.buttonContent}
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
            </Button>

            {/* Demo Account Button */}
            <Button
              mode="outlined"
              onPress={fillDemoCredentials}
              disabled={loading}
              style={styles.demoButton}
              icon="account-cog"
              contentStyle={styles.buttonContent}
            >
              تجربة الحساب التجريبي
            </Button>
          </Card.Content>
        </Card>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            تطبيق البطاقات الذكية الرقمية
          </Text>
          <Text style={styles.versionText}>
            الإصدار 1.0.0
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  formCard: {
    elevation: 4,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 16,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 12,
  },
  demoButton: {
    marginBottom: 8,
  },
  buttonContent: {
    height: 48,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
  },
});

export default LoginScreen;