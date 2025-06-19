// App.tsx - النسخة المحدثة مع نظام الثيمات
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { testConnection } from './src/services/supabase';
import { ThemeProvider, useAppTheme } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Component داخلي للوصول إلى السياق
const AppContent: React.FC = () => {
  const { theme } = useAppTheme();

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
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}