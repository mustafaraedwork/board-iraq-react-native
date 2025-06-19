// src/navigation/AppNavigator.tsx - مُصحح
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/auth/LoginScreen';
import TabNavigator from './TabNavigator';
import { useAppTheme } from '../contexts/ThemeContext';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

// Wrapper component for LoginScreen to handle navigation prop correctly
const LoginScreenWrapper: React.FC = () => {
  const handleLoginSuccess = () => {
    // This will be handled by the auth state change detection
    console.log('Login successful');
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const paperTheme = useTheme();
  const { isDark } = useAppTheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      
      if (userData && isAuthenticated === 'true') {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    const interval = setInterval(async () => {
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      const currentStatus = isAuthenticated === 'true';
      
      if (currentStatus !== isLoggedIn) {
        setIsLoggedIn(currentStatus);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  if (isLoading) {
    return (
      <View style={[
        styles.container, 
        styles.centered, 
        { backgroundColor: paperTheme.colors.background }
      ]}>
        <ActivityIndicator 
          size="large" 
          color={paperTheme.colors.primary} 
          style={styles.loader}
        />
        <Text style={[
          styles.loadingText, 
          { color: paperTheme.colors.onBackground }
        ]}>
          جاري التحميل...
        </Text>
      </View>
    );
  }

  // تخصيص ألوان التنقل حسب الثيم - مُصحح
  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      notification: paperTheme.colors.primary,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: 'normal' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: 'bold' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: paperTheme.colors.background },
        }}
      >
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreenWrapper} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AppNavigator;