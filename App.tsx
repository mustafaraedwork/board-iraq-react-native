import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { testConnection } from './src/services/supabase';
import { colors } from './src/styles/colors';

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
  },
};

export default function App() {
  useEffect(() => {
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
      <View style={styles.container}>
        <Text style={styles.title}>Board Iraq</Text>
        <Text style={styles.subtitle}>البطاقات الذكية</Text>
        <Text style={styles.status}>✅ المشروع جاهز للتطوير</Text>
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    color: colors.success,
    textAlign: 'center',
    marginTop: 20,
  },
});