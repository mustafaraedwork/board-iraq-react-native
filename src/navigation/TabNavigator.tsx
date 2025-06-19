// src/navigation/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Import screens
import DashboardOverviewScreen from '../screens/dashboard/DashboardOverviewScreen';
import ProfileEditScreen from '../screens/dashboard/ProfileEditScreen';
import LinksManagerScreen from '../screens/dashboard/LinksManagerScreen';
import StatsScreen from '../screens/dashboard/StatsScreen';

export type TabParamList = {
  Overview: undefined;
  Profile: undefined;
  Links: undefined;
  Stats: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case 'Overview':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account-edit' : 'account-edit-outline';
              break;
            case 'Links':
              iconName = focused ? 'link' : 'link-variant';
              break;
            case 'Stats':
              iconName = focused ? 'chart-line' : 'chart-line-variant';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -3,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Overview" 
        component={DashboardOverviewScreen}
        options={{
          title: 'لوحة التحكم',
          headerTitle: 'لوحة التحكم - Board Iraq',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileEditScreen}
        options={{
          title: 'الملف الشخصي',
          headerTitle: 'تعديل الملف الشخصي',
        }}
      />
      <Tab.Screen 
        name="Links" 
        component={LinksManagerScreen}
        options={{
          title: 'الروابط',
          headerTitle: 'إدارة الروابط',
        }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{
          title: 'الإحصائيات',
          headerTitle: 'الإحصائيات والتحليلات',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;