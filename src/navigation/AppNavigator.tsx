// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

// الشاشات
import LoginScreen from '../screens/auth/LoginScreen';
import { authService } from '../services/auth';
import { colors, spacing } from '../styles/colors';
import { User } from '../types';

// تعريف أنواع التنقل
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// شاشة لوحة التحكم المؤقتة
function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    // سيتم إعادة تحميل AppNavigator تلقائياً
  };

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <Text style={styles.welcomeText}>
          مرحباً {user?.full_name || user?.username}! 👋
        </Text>
        <Text style={styles.dashboardTitle}>لوحة التحكم</Text>
        <Text style={styles.dashboardSubtitle}>
          هذه نسخة أولية من لوحة التحكم
        </Text>
      </View>

      <View style={styles.dashboardContent}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>الإحصائيات</Text>
          <Text style={styles.statsItem}>
            🏷️ اسم المستخدم: {user?.username}
          </Text>
          <Text style={styles.statsItem}>
            👤 الاسم الكامل: {user?.full_name || 'غير محدد'}
          </Text>
          <Text style={styles.statsItem}>
            🏢 الشركة: {user?.company || 'غير محدد'}
          </Text>
          <Text style={styles.statsItem}>
            💼 المنصب: {user?.job_title || 'غير محدد'}
          </Text>
          <Text style={styles.statsItem}>
            👀 إجمالي الزيارات: {user?.total_visits || 0}
          </Text>
          <Text style={styles.statsItem}>
            🔗 إجمالي النقرات: {user?.total_clicks || 0}
          </Text>
          <Text style={styles.statsItem}>
            ⭐ حساب مميز: {user?.is_premium ? 'نعم' : 'لا'}
          </Text>
          <Text style={styles.statsItem}>
            🛡️ مشرف: {user?.is_admin ? 'نعم' : 'لا'}
          </Text>
        </View>

        <Text style={styles.comingSoonText}>
          🚧 قريباً: إدارة الروابط، تخصيص الألوان، إحصائيات مفصلة
        </Text>
      </View>

      <View style={styles.dashboardFooter}>
        <Text
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          تسجيل الخروج 🚪
        </Text>
      </View>
    </View>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // شاشة التحميل
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>جاري التحقق من تسجيل الدخول...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {isLoggedIn ? (
          // المستخدم مسجل دخول
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Board Iraq - لوحة التحكم',
              headerLeft: () => null, // منع العودة
            }}
          />
        ) : (
          // المستخدم غير مسجل دخول
          <Stack.Screen
            name="Login"
            options={{
              title: 'Board Iraq - تسجيل الدخول',
              headerShown: false, // إخفاء الهيدر في شاشة تسجيل الدخول
            }}
          >
            {(props) => (
              <LoginScreen
                {...props}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.gray[600],
    fontSize: 16,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  dashboardHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  dashboardContent: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    elevation: 2,
    marginBottom: spacing.lg,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsItem: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: spacing.md,
  },
  dashboardFooter: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  logoutButton: {
    fontSize: 16,
    color: colors.error,
    fontWeight: 'bold',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 2,
    textAlign: 'center',
    minWidth: 150,
  },
});