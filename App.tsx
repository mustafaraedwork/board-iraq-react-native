// App.tsx - النسخة المحدثة مع نظام المصادقة
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { testConnection } from './src/services/supabase';
import { colors } from './src/styles/colors';
import AppNavigator from './src/navigation/AppNavigator';

// تخصيص Theme لـ React Native Paper
const theme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
    surface: colors.white,
    accent: colors.primary,
    error: colors.error,
    text: colors.text,
    onSurface: colors.text,
    disabled: colors.gray[400],
    placeholder: colors.gray[500],
    backdrop: 'rgba(0, 0, 0, 0.5)',
    // ألوان إضافية لـ React Native Paper
    notification: colors.primary,
  },
  // إعدادات إضافية للـ theme
  roundness: 8,
  version: 3 as const,
};

export default function App() {
  useEffect(() => {
    // اختبار اتصال قاعدة البيانات عند بدء التطبيق
    const checkConnection = async () => {
      const isConnected = await testConnection();
      if (!isConnected) {
        Alert.alert(
          'خطأ في الاتصال',
          'لا يمكن الاتصال بقاعدة البيانات. تأكد من اتصال الإنترنت.',
          [{ text: 'حسناً' }]
        );
      }
    };
    
    checkConnection();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <AppNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}