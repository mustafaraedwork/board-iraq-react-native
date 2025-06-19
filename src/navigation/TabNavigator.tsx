// src/navigation/TabNavigator.tsx - مُصحح تماماً
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, useTheme, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DashboardOverviewScreen from '../screens/dashboard/DashboardOverviewScreen';
import ProfileEditScreen from '../screens/dashboard/ProfileEditScreen';
import LinksManagerScreen from '../screens/dashboard/LinksManagerScreen';
import StatsScreen from '../screens/dashboard/StatsScreen';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { useAppTheme } from '../contexts/ThemeContext';

export type TabParamList = {
  Overview: undefined;
  Profile: undefined;
  Links: undefined;
  Stats: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  const paperTheme = useTheme();
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'isAuthenticated']);
      // سيتم إعادة التوجيه تلقائياً بواسطة AppNavigator
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Header مخصص مع زر تبديل الثيم
  const CustomHeader = ({ title }: { title: string }) => (
    <Appbar.Header
      style={[
        styles.header,
        {
          backgroundColor: paperTheme.colors.surface,
          paddingTop: insets.top,
        },
      ]}
      statusBarHeight={0}
    >
      <Appbar.Content
        title={title}
        titleStyle={{
          color: paperTheme.colors.onSurface,
          fontWeight: 'bold',
        }}
      />
      <ThemeToggleButton />
      <Appbar.Action
        icon="logout"
        iconColor={paperTheme.colors.onSurface}
        onPress={handleLogout}
      />
    </Appbar.Header>
  );

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      {/* Header ثابت */}
      <CustomHeader title="Board Iraq" />
      
      {/* Tab Navigator */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, size }) => {
            let iconName: string;
            
            switch (route.name) {
              case 'Overview':
                iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                break;
              case 'Profile':
                iconName = focused ? 'account' : 'account-outline';
                break;
              case 'Links':
                iconName = focused ? 'link' : 'link-variant';
                break;
              case 'Stats':
                iconName = focused ? 'chart-line' : 'chart-line-variant';
                break;
              default:
                iconName = 'circle';
            }

            return (
              <Icon
                name={iconName as any}
                size={size}
                color={focused ? paperTheme.colors.primary : paperTheme.colors.onSurfaceVariant}
              />
            );
          },
          // إصلاح المشكلة: استخدام tabBarLabel كـ component بدلاً من string
          tabBarLabel: ({ focused, color }) => {
            let label: string;
            
            switch (route.name) {
              case 'Overview':
                label = 'نظرة عامة';
                break;
              case 'Profile':
                label = 'الملف الشخصي';
                break;
              case 'Links':
                label = 'الروابط';
                break;
              case 'Stats':
                label = 'الإحصائيات';
                break;
              default:
                label = '';
            }

            return (
              <Text 
                style={{ 
                  color,
                  fontSize: 12,
                  fontWeight: focused ? '600' : '400',
                  textAlign: 'center'
                }}
                numberOfLines={1}
              >
                {label}
              </Text>
            );
          },
          tabBarActiveTintColor: paperTheme.colors.primary,
          tabBarInactiveTintColor: paperTheme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: paperTheme.colors.surface,
            borderTopColor: paperTheme.colors.outline,
            borderTopWidth: 1,
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom,
          },
          tabBarItemStyle: {
            paddingTop: 8,
          },
        })}
      >
        <Tab.Screen
          name="Overview"
          component={DashboardOverviewScreen}
          options={{ title: 'نظرة عامة' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileEditScreen}
          options={{ title: 'الملف الشخصي' }}
        />
        <Tab.Screen
          name="Links"
          component={LinksManagerScreen}
          options={{ title: 'الروابط' }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{ title: 'الإحصائيات' }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default TabNavigator;